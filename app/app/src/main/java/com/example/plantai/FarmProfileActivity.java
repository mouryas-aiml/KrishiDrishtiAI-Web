package com.example.plantai;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

public class FarmProfileActivity extends AppCompatActivity {

    private static final String PREFS_NAME = "KrishiDrishtiFarmPrefs";
    private EditText etFarmName, etLocation, etFieldSize, etMainCrop;
    private Button btnSaveProfile;
    private ImageView btnBack;
    private ImageButton btnSpeakProfile;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_farm_profile);

        etFarmName = findViewById(R.id.etFarmName);
        etLocation = findViewById(R.id.etLocation);
        etFieldSize = findViewById(R.id.etFieldSize);
        etMainCrop = findViewById(R.id.etMainCrop);
        btnSaveProfile = findViewById(R.id.btnSaveProfile);
        btnBack = findViewById(R.id.btnBackFarm);
        btnSpeakProfile = findViewById(R.id.btnSpeakProfile);

        if (btnBack != null) {
            btnBack.setOnClickListener(v -> finish());
        }

        loadFarmProfile();

        btnSaveProfile.setOnClickListener(v -> {
            saveFarmProfile();
            Toast.makeText(FarmProfileActivity.this, "Farm Profile Saved Successfully!", Toast.LENGTH_SHORT).show();
        });

        if (btnSpeakProfile != null) {
            btnSpeakProfile.setOnClickListener(v -> {
                String speakText = "Welcome to Krishi Drishti Farm Profile. Your registered main crop is "
                        + etMainCrop.getText().toString() + ". Remember to maintain field channels and apply organic bio-fungicides during flowering stage.";
                SharedPreferences prefs = getSharedPreferences("Settings", MODE_PRIVATE);
                String langCode = prefs.getString("app_lang", "en");
                TtsManager.getInstance(this).speak(speakText, langCode);
            });
        }
    }

    private void loadFarmProfile() {
        SharedPreferences prefs = getSharedPreferences(PREFS_NAME, MODE_PRIVATE);
        etFarmName.setText(prefs.getString("farm_name", "Green Valley Farm"));
        etLocation.setText(prefs.getString("farm_location", "Mandya, Karnataka"));
        etFieldSize.setText(prefs.getString("field_size", "3.5"));
        etMainCrop.setText(prefs.getString("main_crop", "Tomato / Potato"));
    }

    private void saveFarmProfile() {
        SharedPreferences.Editor editor = getSharedPreferences(PREFS_NAME, MODE_PRIVATE).edit();
        editor.putString("farm_name", etFarmName.getText().toString().trim());
        editor.putString("farm_location", etLocation.getText().toString().trim());
        editor.putString("field_size", etFieldSize.getText().toString().trim());
        editor.putString("main_crop", etMainCrop.getText().toString().trim());
        editor.apply();
    }
}
