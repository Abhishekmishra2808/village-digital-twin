package com.yourorg.ruralens

import android.app.Application
import android.util.Log
import com.runanywhere.sdk.public.RunAnywhere
import com.runanywhere.sdk.data.models.SDKEnvironment
import com.runanywhere.sdk.public.extensions.addModelFromURL
import com.runanywhere.sdk.llm.llamacpp.LlamaCppServiceProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class RuraLensApplication : Application() {

    override fun onCreate() {
        super.onCreate()

        // Initialize SDK asynchronously (do not block main thread)
        CoroutineScope(Dispatchers.IO).launch {
            try {
                Log.i("RuraLens", "Starting SDK initialization...")

                RunAnywhere.initialize(
                    context = this@RuraLensApplication,
                    apiKey = "dev",
                    environment = SDKEnvironment.DEVELOPMENT
                )

                LlamaCppServiceProvider.register()

                registerModels()

                RunAnywhere.scanForDownloadedModels()

                Log.i("RuraLens", "SDK initialized successfully")
            } catch (e: Exception) {
                Log.e("RuraLens", "SDK initialization failed: ${e.message}", e)
            }
        }
    }

    private suspend fun registerModels() {
        try {
            addModelFromURL(
                url = "https://huggingface.co/MufeedVH/smollm2-360m-Q8_0-GGUF/resolve/main/smollm2-360m-q8_0.gguf",
                name = "SmolLM2 360M Q8_0",
                type = "LLM"
            )
            Log.i("RuraLens", "Model registered: SmolLM2 360M Q8_0")
        } catch (e: Exception) {
            Log.e("RuraLens", "Model registration failed: ${e.message}", e)
        }
    }
}
