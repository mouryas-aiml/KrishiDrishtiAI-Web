package com.example.plantai;

import android.content.Context;
import android.speech.tts.TextToSpeech;
import android.util.Log;

import java.util.Locale;

public class TtsManager implements TextToSpeech.OnInitListener {
    private static final String TAG = "TtsManager";
    private static TtsManager instance;
    private TextToSpeech tts;
    private boolean isInitialized = false;
    private String pendingText;
    private String pendingLang;

    private TtsManager(Context context) {
        tts = new TextToSpeech(context.getApplicationContext(), this);
    }

    public static synchronized TtsManager getInstance(Context context) {
        if (instance == null) {
            instance = new TtsManager(context);
        }
        return instance;
    }

    @Override
    public void onInit(int status) {
        if (status == TextToSpeech.SUCCESS) {
            isInitialized = true;
            Log.d(TAG, "TextToSpeech initialized successfully.");
            if (pendingText != null && pendingLang != null) {
                speak(pendingText, pendingLang);
                pendingText = null;
                pendingLang = null;
            }
        } else {
            Log.e(TAG, "TextToSpeech initialization failed!");
        }
    }

    public void speak(String text, String langCode) {
        if (text == null || text.trim().isEmpty()) return;

        if (!isInitialized) {
            pendingText = text;
            pendingLang = langCode;
            return;
        }

        Locale locale;
        if ("kn".equalsIgnoreCase(langCode)) {
            locale = new Locale("kn", "IN");
        } else if ("hi".equalsIgnoreCase(langCode)) {
            locale = new Locale("hi", "IN");
        } else if ("mr".equalsIgnoreCase(langCode)) {
            locale = new Locale("mr", "IN");
        } else {
            locale = Locale.ENGLISH;
        }

        int result = tts.setLanguage(locale);
        if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
            Log.w(TAG, "Language " + langCode + " is missing or not supported. Falling back to English.");
            tts.setLanguage(Locale.ENGLISH);
        }

        stop();
        tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "KRISHI_DRISHTI_TTS");
    }

    public void stop() {
        if (tts != null && tts.isSpeaking()) {
            tts.stop();
        }
    }

    public boolean isSpeaking() {
        return tts != null && tts.isSpeaking();
    }

    public void shutdown() {
        if (tts != null) {
            tts.stop();
            tts.shutdown();
            isInitialized = false;
            instance = null;
        }
    }
}
