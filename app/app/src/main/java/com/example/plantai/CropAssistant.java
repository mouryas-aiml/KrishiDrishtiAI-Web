package com.example.plantai;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.speech.RecognizerIntent;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

import androidx.annotation.Nullable;
import androidx.appcompat.app.AppCompatActivity;

import java.util.ArrayList;
import java.util.Locale;

public class CropAssistant extends AppCompatActivity {

    private static final int REQUEST_CODE_SPEECH_INPUT = 1001;
    private LinearLayout chatContainer;
    private ScrollView chatScrollView;
    private EditText etQuestion;
    private ImageButton btnSend;
    private ImageView btnBack;
    private Button chip1, chip2, chip3;
    private String langCode = "en";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_crop_assistant);

        SharedPreferences prefs = getSharedPreferences("Settings", MODE_PRIVATE);
        langCode = prefs.getString("app_lang", "en");

        chatContainer = findViewById(R.id.chatContainer);
        chatScrollView = findViewById(R.id.chatScrollView);
        etQuestion = findViewById(R.id.etQuestion);
        btnSend = findViewById(R.id.btnSend);
        btnBack = findViewById(R.id.btnBackAssistant);

        chip1 = findViewById(R.id.chip1);
        chip2 = findViewById(R.id.chip2);
        chip3 = findViewById(R.id.chip3);

        if (btnBack != null) {
            btnBack.setOnClickListener(v -> finish());
        }

        btnSend.setOnClickListener(v -> sendMessage());

        chip1.setOnClickListener(v -> {
            etQuestion.setText("How to manage Early Blight in Tomato and Potato?");
            sendMessage();
        });

        chip2.setOnClickListener(v -> {
            etQuestion.setText("What are organic ways to prevent pests and fungal disease?");
            sendMessage();
        });

        chip3.setOnClickListener(v -> {
            etQuestion.setText("How to protect crops during heavy rains and humid weather?");
            sendMessage();
        });
    }

    public void startVoiceInput(View view) {
        Intent intent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);

        if ("kn".equalsIgnoreCase(langCode)) {
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "kn-IN");
        } else if ("hi".equalsIgnoreCase(langCode)) {
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN");
        } else if ("mr".equalsIgnoreCase(langCode)) {
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, "mr-IN");
        } else {
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault());
        }

        try {
            startActivityForResult(intent, REQUEST_CODE_SPEECH_INPUT);
        } catch (Exception e) {
            etQuestion.setHint("Speech input not supported on this device.");
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == REQUEST_CODE_SPEECH_INPUT && resultCode == RESULT_OK && data != null) {
            ArrayList<String> result = data.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS);
            if (result != null && !result.isEmpty()) {
                etQuestion.setText(result.get(0));
                sendMessage();
            }
        }
    }

    private void sendMessage() {
        String query = etQuestion.getText().toString().trim();
        if (TextUtils.isEmpty(query)) return;

        // Add user bubble
        addUserBubble(query);
        etQuestion.setText("");

        // Generate AI response
        String aiResponse = generateAiResponse(query);
        addAiBubble(aiResponse);

        // Read aloud with TTS
        TtsManager.getInstance(this).speak(aiResponse, langCode);

        chatScrollView.post(() -> chatScrollView.fullScroll(ScrollView.FOCUS_DOWN));
    }

    private void addUserBubble(String message) {
        LinearLayout userLayout = new LinearLayout(this);
        userLayout.setOrientation(LinearLayout.VERTICAL);
        userLayout.setPadding(24, 16, 24, 16);
        userLayout.setBackgroundColor(getResources().getColor(R.color.colorEarthyLight));

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(60, 0, 0, 16);
        userLayout.setLayoutParams(params);

        TextView senderText = new TextView(this);
        senderText.setText("🧑‍🌾 You");
        senderText.setTextSize(12);
        senderText.setTextColor(getResources().getColor(R.color.colorTextSecondary));

        TextView msgText = new TextView(this);
        msgText.setText(message);
        msgText.setTextSize(14);
        msgText.setTextColor(getResources().getColor(R.color.colorTextPrimary));

        userLayout.addView(senderText);
        userLayout.addView(msgText);
        chatContainer.addView(userLayout);
    }

    private void addAiBubble(String message) {
        LinearLayout aiLayout = new LinearLayout(this);
        aiLayout.setOrientation(LinearLayout.VERTICAL);
        aiLayout.setPadding(24, 16, 24, 16);
        aiLayout.setBackgroundColor(getResources().getColor(R.color.colorWhite));

        LinearLayout.LayoutParams params = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT);
        params.setMargins(0, 0, 60, 16);
        aiLayout.setLayoutParams(params);

        TextView senderText = new TextView(this);
        senderText.setText("🤖 Krishi Drishti AI Expert");
        senderText.setTextSize(12);
        senderText.setTextColor(getResources().getColor(R.color.colorPrimary));

        TextView msgText = new TextView(this);
        msgText.setText(message);
        msgText.setTextSize(14);
        msgText.setTextColor(getResources().getColor(R.color.colorTextPrimary));

        aiLayout.addView(senderText);
        aiLayout.addView(msgText);
        chatContainer.addView(aiLayout);
    }

    private String generateAiResponse(String input) {
        String lower = input.toLowerCase();

        if ("kn".equalsIgnoreCase(langCode)) {
            if (lower.contains("blight") || lower.contains("ರೋಗ")) {
                return "🌱 **ಅರ್ಲಿ ಮತ್ತು ಲೇಟ್ ಬ್ಲೈಟ್ ಮಾರ್ಗದರ್ಶನ**:\n\n"
                        + "• **ಲಕ್ಷಣಗಳು**: ಕೆಳಗಿನ ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು ಮತ್ತು ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುವುದು.\n"
                        + "• **ಜೈವಿಕ ಚಿಕಿತ್ಸೆ**: ಬೇವಿನ ಎಣ್ಣೆ (5ml/L) ಅಥವಾ ಟ್ರೈಕೋಡರ್ಮಾ ಜೈವಿಕ ಶಿಲೀಂಧ್ರನಾಶಕವನ್ನು ಸಿಂಪಡಿಸಿ.\n"
                        + "• **ಮುನ್ನೆಚ್ಚರಿಕೆ**: ಗಿಡಗಳ ನಡುವೆ ಉತ್ತಮ ಗಾಳಿಯಾಡುವಿಕೆಗೆ ಸೂಕ್ತ ಅಂತರ ನಿರ್ವಹಿಸಿ.";
            } else {
                return "🌾 **ಕೃಷಿ ದೃಷ್ಟಿ ಎಐ ಸಲಹೆ**:\n\n"
                        + "ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಧನ್ಯವಾದಗಳು! ಉತ್ತಮ ಬೆಳೆ ಆರೋಗ್ಯಕ್ಕಾಗಿ:\n"
                        + "1. ಬೇರಿನ ಮಟ್ಟದಲ್ಲಿ ಸಮತೋಲಿತ ನೀರಾವರಿ ನೀಡಿ.\n"
                        + "2. ಯಾವುದೇ ಅನುಮಾನಾಸ್ಪದ ಎಲೆ ಚುಕ್ಕೆಗಳನ್ನು ಎಐ ಸ್ಕ್ಯಾನ್ ಮೂಲಕ ತಕ್ಷಣ ಪರಿಶೀಲಿಸಿ.";
            }
        }

        if (lower.contains("early blight") || lower.contains("blight")) {
            return "🌱 **Early & Late Blight Guidance**:\n\n"
                    + "• **Symptoms**: Dark brown spots with concentric rings on lower leaves, leading to yellowing.\n"
                    + "• **Organic Action**: Apply Neem oil solution (5ml/L) or Bacillus subtilis bio-fungicide.\n"
                    + "• **Cultural Care**: Avoid overhead watering. Ensure wide plant spacing for airflow.\n"
                    + "• **Prevention**: Rotate crops with non-solanaceous crops (e.g. legumes or corn) every 2 seasons.";
        } else if (lower.contains("organic") || lower.contains("pest") || lower.contains("neem")) {
            return "🌿 **Organic Crop Protection Best Practices**:\n\n"
                    + "• **Neem Oil Spray**: Mix 5ml cold-pressed Neem oil + 1ml liquid soap per 1L water for aphids & mites.\n"
                    + "• **Bio-Fungicides**: Use Trichoderma viride in soil during planting to suppress fungal pathogens.\n"
                    + "• **Yellow Sticky Traps**: Deploy 10 traps per acre to monitor whiteflies and thrips naturally.\n"
                    + "• **Compost Tea**: Foliar spray diluted vermicompost tea to strengthen leaf immunity.";
        } else if (lower.contains("rain") || lower.contains("humid") || lower.contains("weather")) {
            return "⛅ **Rainy & High Humidity Crop Management**:\n\n"
                    + "• **Drainage**: Maintain deep field channels to prevent water stagnation around root zones.\n"
                    + "• **Fungus Warning**: High humidity above 80% increases Downy Mildew and Rust risks.\n"
                    + "• **Pruning**: Remove lower yellowing leaves up to 1 foot above ground level.\n"
                    + "• **Post-Rain Care**: Apply bio-agents like Pseudomonas fluorescens after rain stops.";
        } else if (lower.contains("fertilizer") || lower.contains("nitrogen") || lower.contains("potash")) {
            return "🌾 **Nutrient Management Advice**:\n\n"
                    + "• **Basal Dose**: Apply well-decomposed FYM (Farm Yard Manure) with Trichoderma before sowing.\n"
                    + "• **Vegetative Growth**: Balanced N-P-K (e.g. 19:19:19) promotes root & leaf development.\n"
                    + "• **Flowering Stage**: High Potassium & Boron sprays prevent flower drop and boost fruit size.";
        } else {
            return "🌾 **Krishi Drishti AI Crop Advisory**:\n\n"
                    + "Thank you for asking! For best crop health:\n"
                    + "1. Ensure balanced irrigation at root level.\n"
                    + "2. Regularly inspect under-leaf surfaces for early pest activity.\n"
                    + "3. Use the AI Leaf Scan feature in Krishi Drishti to photograph any suspicious leaf spots for instant classification.";
        }
    }

    @Override
    protected void onPause() {
        super.onPause();
        TtsManager.getInstance(this).stop();
    }
}
