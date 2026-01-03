package com.yourorg.ruralens

import android.util.Log
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

@CapacitorPlugin(name = "LocalLLM")
class LocalLLMPlugin : Plugin() {
    private val TAG = "LocalLLMPlugin"
    private val scope = CoroutineScope(Dispatchers.Main)

    @PluginMethod
    fun anonymizeFeedback(call: PluginCall) {
        val rawComment = call.getString("comment") ?: ""
        val rating = call.getInt("rating") ?: 3
        val schemeName = call.getString("schemeName") ?: "Unknown Scheme"

        scope.launch {
            try {
                val result = performAnonymization(rawComment, rating, schemeName)
                call.resolve(result)
            } catch (e: Exception) {
                Log.e(TAG, "Error anonymizing feedback", e)
                call.reject("Failed to anonymize feedback: ${e.message}")
            }
        }
    }

    private suspend fun performAnonymization(
        rawComment: String,
        rating: Int,
        schemeName: String
    ): JSObject = withContext(Dispatchers.IO) {
        try {
            // For now, we'll use a simple local processing approach
            // The RunanywhereAI SDK requires model setup which is complex
            // So we'll implement a basic anonymization until the SDK is properly configured

            val prompt = """
                You are analyzing citizen feedback for a government scheme. The citizen has rated the scheme $rating/5 stars and provided this comment:
                
                "$rawComment"
                
                Scheme Name: $schemeName
                
                CRITICAL: You must completely anonymize this feedback by:
                - Removing ALL names (first names, last names, nicknames)
                - Removing ALL addresses (house numbers, street names, localities)
                - Removing ALL personal identifiers
                - Making the language neutral and professional
                - Converting "I" or personal pronouns to third-person descriptions
                
                Provide:
                1. A professional, anonymized summary (2-3 sentences)
                2. Main concerns or issues (3 bullet points)
                3. Sentiment (Positive/Neutral/Negative/Critical)
                4. Issue categories (Quality, Delay, Budget, Vendor, Communication, Accessibility, Other)
                5. Urgency level (Low/Medium/High/Critical)
                
                Return ONLY a JSON object with this structure:
                {
                  "summary": "Brief professional summary - FULLY ANONYMIZED",
                  "concerns": ["concern 1", "concern 2", "concern 3"],
                  "sentiment": "Positive/Neutral/Negative/Critical",
                  "categories": ["Quality", "Delay"],
                  "urgency": "Low/Medium/High/Critical",
                  "suggestedRating": 3
                }
            """.trimIndent()

            // TODO: Integrate with RunanywhereAI SDK here
            // For now, provide a basic fallback response

            val anonymizedSummary = anonymizeBasic(rawComment, rating)
            val sentiment = when {
                rating >= 4 -> "Positive"
                rating >= 3 -> "Neutral"
                rating >= 2 -> "Negative"
                else -> "Critical"
            }

            val result = JSObject()
            result.put("success", true)

            val analysis = JSObject()
            analysis.put("summary", anonymizedSummary)
            analysis.put("concerns", JSONArray(listOf("Awaiting on-device LLM processing")))
            analysis.put("sentiment", sentiment)
            analysis.put("categories", JSONArray(listOf("Other")))
            analysis.put("urgency", if (rating <= 2) "High" else "Medium")
            analysis.put("suggestedRating", rating)

            result.put("analysis", analysis)
            result.put("processedLocally", true)

            Log.d(TAG, "Feedback anonymized locally: $anonymizedSummary")

            result
        } catch (e: Exception) {
            Log.e(TAG, "Error in performAnonymization", e)

            // Fallback response
            val result = JSObject()
            result.put("success", false)
            result.put("error", e.message)

            val analysis = JSObject()
            analysis.put(
                "summary",
                "Feedback received with $rating/5 rating. Local processing temporarily unavailable."
            )
            analysis.put("concerns", JSONArray(listOf("Local LLM unavailable")))
            analysis.put("sentiment", if (rating >= 3) "Neutral" else "Negative")
            analysis.put("categories", JSONArray(listOf("Other")))
            analysis.put("urgency", "Medium")
            analysis.put("suggestedRating", rating)

            result.put("analysis", analysis)
            result
        }
    }

    private fun anonymizeBasic(comment: String, rating: Int): String {
        // Basic anonymization: remove common personal identifiers
        var anonymized = comment

        // Remove common name patterns
        anonymized = anonymized.replace(Regex("\\bMr\\.?\\s+\\w+"), "individual")
        anonymized = anonymized.replace(Regex("\\bMrs\\.?\\s+\\w+"), "resident")
        anonymized = anonymized.replace(Regex("\\bMs\\.?\\s+\\w+"), "citizen")
        anonymized = anonymized.replace(Regex("\\bDr\\.?\\s+\\w+"), "professional")

        // Remove address patterns
        anonymized = anonymized.replace(Regex("\\bhouse\\s+no\\.?\\s*\\d+"), "residence")
        anonymized = anonymized.replace(Regex("\\bflat\\s+\\d+"), "unit")
        anonymized = anonymized.replace(Regex("\\b\\d{6}\\b"), "[PIN]")

        // Remove phone numbers
        anonymized = anonymized.replace(Regex("\\b\\d{10}\\b"), "[PHONE]")
        anonymized = anonymized.replace(Regex("\\b\\d{3}[-.]\\d{3}[-.]\\d{4}\\b"), "[PHONE]")

        // Convert first person to third person
        anonymized = anonymized.replace(Regex("\\bI\\s+"), "The citizen ")
        anonymized = anonymized.replace(Regex("\\bmy\\b", RegexOption.IGNORE_CASE), "their")
        anonymized = anonymized.replace(Regex("\\bme\\b", RegexOption.IGNORE_CASE), "them")

        // Create professional summary
        val sentiment = when {
            rating >= 4 -> "positive feedback"
            rating >= 3 -> "neutral feedback"
            else -> "concerns"
        }

        return "Resident provided $sentiment regarding scheme implementation. $anonymized"
    }

    @PluginMethod
    fun checkModelStatus(call: PluginCall) {
        val result = JSObject()
        result.put("available", true)
        result.put(
            "modelInstalled",
            false
        ) // Will be true when RunanywhereAI SDK is fully integrated
        result.put("provider", "RunanywhereAI SDK")
        result.put("status", "Initializing - Basic anonymization active")
        call.resolve(result)
    }
}
