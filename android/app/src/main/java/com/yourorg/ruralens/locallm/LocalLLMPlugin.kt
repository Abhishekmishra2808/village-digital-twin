package com.yourorg.ruralens.locallm

import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import com.runanywhere.sdk.public.RunAnywhere
import com.runanywhere.sdk.public.extensions.listAvailableModels
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.collect
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.delay

@CapacitorPlugin(name = "LocalLLM")
class LocalLLMPlugin : Plugin() {

    private val coroutineScope = CoroutineScope(Dispatchers.Main)

    @PluginMethod
    fun anonymizeFeedback(call: PluginCall) {
        val feedback = call.getString("feedback")

        if (feedback == null) {
            call.reject("Feedback text is required")
            return
        }

        coroutineScope.launch {
            try {
                // Emit status updates during processing
                val result = anonymizeTextWithProgress(feedback, call)
                val ret = JSObject()
                ret.put("anonymizedFeedback", result)
                ret.put("success", true)
                call.resolve(ret)
            } catch (e: Exception) {
                Log.e("LocalLLM", "Anonymization failed", e)
                emitStatus("error", "Anonymization failed: ${e.message}")
                call.reject("Anonymization failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun checkStatus(call: PluginCall) {
        coroutineScope.launch {
            try {
                val models = listAvailableModels()
                val downloadedModels = models.filter { it.isDownloaded }

                val ret = JSObject()
                ret.put("isAvailable", downloadedModels.isNotEmpty())
                ret.put("totalModels", models.size)
                ret.put("downloadedModels", downloadedModels.size)
                ret.put("modelName", downloadedModels.firstOrNull()?.name ?: "None")

                call.resolve(ret)
            } catch (e: Exception) {
                Log.e("LocalLLM", "Status check failed", e)
                call.reject("Status check failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun downloadModel(call: PluginCall) {
        val modelId = call.getString("modelId") ?: "smollm2-360m-q8_0"

        coroutineScope.launch {
            try {
                withContext(Dispatchers.IO) {
                    // Download with progress tracking
                    RunAnywhere.downloadModel(modelId).collect { progress ->
                        // Send progress update
                        val progressObj = JSObject()
                        progressObj.put("progress", progress)
                        progressObj.put("modelId", modelId)
                        progressObj.put("status", "downloading")
                        progressObj.put(
                            "message",
                            "Downloading SmolLM2 360M model: ${(progress * 100).toInt()}%"
                        )
                        notifyListeners("aiProcessingStatus", progressObj)
                    }
                }

                val ret = JSObject()
                ret.put("success", true)
                ret.put("message", "Model downloaded successfully")
                call.resolve(ret)
            } catch (e: Exception) {
                Log.e("LocalLLM", "Download failed", e)
                call.reject("Download failed: ${e.message}")
            }
        }
    }

    @PluginMethod
    fun loadModel(call: PluginCall) {
        val modelId = call.getString("modelId") ?: "smollm2-360m-q8_0"

        coroutineScope.launch {
            try {
                withContext(Dispatchers.IO) {
                    RunAnywhere.loadModel(modelId)
                }

                val ret = JSObject()
                ret.put("success", true)
                ret.put("message", "Model loaded successfully")
                call.resolve(ret)
            } catch (e: Exception) {
                Log.e("LocalLLM", "Load failed", e)
                call.reject("Load failed: ${e.message}")
            }
        }
    }

    private suspend fun anonymizeTextWithProgress(feedback: String, call: PluginCall): String {
        return withContext(Dispatchers.IO) {
            try {
                // Step 1: Check if model exists
                emitStatus("checking", "Checking AI model availability...")
                delay(500) // Brief delay for UI update

                val models = listAvailableModels()
                val model = models.find { it.name == "SmolLM2 360M Q8_0" }

                if (model == null) {
                    emitStatus("error", "Model not registered")
                    return@withContext fallbackAnonymization(feedback)
                }

                // Step 2: Download model if needed
                if (!model.isDownloaded) {
                    emitStatus("downloading", "Downloading SmolLM2 360M model (119 MB)...")
                    Log.i("LocalLLM", "Model not downloaded, starting download...")

                    try {
                        RunAnywhere.downloadModel(model.id).collect { progress ->
                            val percent = (progress * 100).toInt()
                            emitStatus(
                                "downloading",
                                "Downloading SmolLM2 360M model: $percent%",
                                progress
                            )
                        }
                        emitStatus("downloaded", "Model downloaded successfully!")
                    } catch (e: Exception) {
                        Log.e("LocalLLM", "Download failed, using fallback", e)
                        emitStatus("fallback", "Using basic anonymization (model download failed)")
                        return@withContext fallbackAnonymization(feedback)
                    }
                }

                // Step 3: Load model into memory
                emitStatus("loading", "Loading AI model into memory...")
                delay(500)

                try {
                    RunAnywhere.loadModel(model.id)
                    emitStatus("loaded", "AI model loaded successfully!")
                } catch (e: Exception) {
                    Log.e("LocalLLM", "Load failed, using fallback", e)
                    emitStatus("fallback", "Using basic anonymization (model load failed)")
                    return@withContext fallbackAnonymization(feedback)
                }

                // Step 4: Generate anonymized text
                emitStatus("processing", "AI is analyzing and anonymizing your feedback...")
                delay(300)

                val prompt = """
You are a privacy assistant. Your job is to anonymize sensitive information in citizen feedback.

Remove or replace:
- Personal names (use [NAME] or [PERSON])
- Phone numbers (use [PHONE])
- Email addresses (use [EMAIL])
- Specific addresses (use [ADDRESS])
- ID numbers (use [ID])
- Other personally identifiable information

Keep the core message and sentiment intact. Only output the anonymized text, nothing else.

Original feedback:
$feedback

Anonymized feedback:
""".trimIndent()

                val result = RunAnywhere.generate(prompt)

                emitStatus("complete", "Feedback anonymized successfully with AI!")
                delay(500)

                result.trim()

            } catch (e: Exception) {
                Log.e("LocalLLM", "AI processing failed, using fallback", e)
                emitStatus("fallback", "Using basic anonymization (AI processing failed)")
                fallbackAnonymization(feedback)
            }
        }
    }

    private fun emitStatus(status: String, message: String, progress: Float = 0f) {
        val statusObj = JSObject()
        statusObj.put("status", status)
        statusObj.put("message", message)
        statusObj.put("progress", progress)
        statusObj.put("timestamp", System.currentTimeMillis())

        Log.i("LocalLLM", "Status: $status - $message")
        notifyListeners("aiProcessingStatus", statusObj)
    }

    private fun fallbackAnonymization(text: String): String {
        var anonymized = text

        // Basic regex replacements
        anonymized = anonymized.replace(Regex("\\b[A-Z][a-z]+ [A-Z][a-z]+\\b"), "[NAME]")
        anonymized = anonymized.replace(Regex("\\b\\d{10}\\b"), "[PHONE]")
        anonymized = anonymized.replace(
            Regex("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b"),
            "[EMAIL]"
        )

        return anonymized
    }
}
