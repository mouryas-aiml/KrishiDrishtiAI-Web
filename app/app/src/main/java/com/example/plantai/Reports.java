package com.example.plantai;

import androidx.activity.OnBackPressedCallback;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.cardview.widget.CardView;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.content.Intent;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.graphics.Color;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.widget.ImageView;
import android.widget.TextView;

import com.github.mikephil.charting.charts.PieChart;
import com.github.mikephil.charting.data.PieData;
import com.github.mikephil.charting.data.PieDataSet;
import com.github.mikephil.charting.data.PieEntry;
import com.github.mikephil.charting.utils.ColorTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class Reports extends AppCompatActivity implements ReportCardsAdapter.ReportCardOnClickListener {

    DatabaseHelper myDB;

    private static final String SHARED = "Settings";
    private static final String SHARED_APP_LANG = "app_lang";
    private String selected_lang;

    private RecyclerView recyclerView;
    private RecyclerView.Adapter adapter;
    private RecyclerView.LayoutManager layoutManager;
    private ArrayList<ReportCard> reportCardList;
    private String[] diseaseName = new String[39];
    private ArrayList<Integer> id = new ArrayList<>();

    private CardView cardView, cardChart;
    private TextView empText;
    private PieChart pieChart;
    private ImageView btnBack;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_reports);

        __init__();
        selected_lang = load_setting();
        setLang();

        if (btnBack != null) {
            btnBack.setOnClickListener(v -> {
                Intent intent = new Intent(Reports.this, Home.class);
                startActivity(intent);
                finish();
            });
        }

        // Generate data
        viewAll();
        reportRecyclerViewConfig();

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                Intent intent = new Intent(Reports.this, Home.class);
                startActivity(intent);
                finish();
            }
        });
    }

    private void genrateReportData(String diseaseName, String date) {
        reportCardList.add(new ReportCard(diseaseName, date));
    }

    private void reportRecyclerViewConfig() {
        recyclerView = findViewById(R.id.recyclerViewReports);
        recyclerView.setHasFixedSize(true);
        layoutManager = new LinearLayoutManager(this);
        adapter = new ReportCardsAdapter(reportCardList, this);

        recyclerView.setLayoutManager(layoutManager);
        recyclerView.setAdapter(adapter);
    }

    public void viewAll() {
        Cursor cursor = myDB.getAllData();
        Map<String, Integer> diseaseCounts = new HashMap<>();

        if (cursor == null || cursor.getCount() == 0) {
            if (cardView != null) cardView.setVisibility(View.VISIBLE);
            if (cardChart != null) cardChart.setVisibility(View.GONE);
            return;
        }

        if (cardView != null) cardView.setVisibility(View.GONE);
        if (cardChart != null) cardChart.setVisibility(View.VISIBLE);

        while (cursor.moveToNext()) {
            int recId = cursor.getInt(0);
            this.id.add(recId);
            String date = cursor.getString(1);
            String time = cursor.getString(2);
            int maxIndex = cursor.getInt(3);

            String name = (maxIndex >= 0 && maxIndex < diseaseName.length) ? diseaseName[maxIndex] : "Unknown";
            genrateReportData(name, date + " " + time);

            diseaseCounts.put(name, diseaseCounts.getOrDefault(name, 0) + 1);
        }
        cursor.close();

        setupPieChart(diseaseCounts);
    }

    private void setupPieChart(Map<String, Integer> counts) {
        if (pieChart == null) return;

        ArrayList<PieEntry> entries = new ArrayList<>();
        for (Map.Entry<String, Integer> entry : counts.entrySet()) {
            entries.add(new PieEntry(entry.getValue(), entry.getKey()));
        }

        PieDataSet dataSet = new PieDataSet(entries, "Diseases");
        dataSet.setColors(ColorTemplate.MATERIAL_COLORS);
        dataSet.setValueTextColor(Color.WHITE);
        dataSet.setValueTextSize(12f);

        PieData data = new PieData(dataSet);
        pieChart.setData(data);
        pieChart.getDescription().setEnabled(false);
        pieChart.setCenterText("Health Stats");
        pieChart.animateY(1000);
        pieChart.invalidate();
    }

    private void __init__() {
        myDB = new DatabaseHelper(this);
        reportCardList = new ArrayList<>();
        cardView = findViewById(R.id.notScannedYet);
        cardChart = findViewById(R.id.cardChart);
        pieChart = findViewById(R.id.pieChart);
        empText = findViewById(R.id.emptyReportText);
        btnBack = findViewById(R.id.btnBackReports);
    }

    private void setLang() {
        diseaseName[0] = getString(R.string.dname_01);
        diseaseName[1] = getString(R.string.dname_02);
        diseaseName[2] = getString(R.string.dname_03);
        diseaseName[3] = getString(R.string.dname_04);
        diseaseName[4] = getString(R.string.dname_05);
        diseaseName[5] = getString(R.string.dname_06);
        diseaseName[6] = getString(R.string.dname_07);
        diseaseName[7] = getString(R.string.dname_08);
        diseaseName[8] = getString(R.string.dname_09);
        diseaseName[9] = getString(R.string.dname_10);
        diseaseName[10] = getString(R.string.dname_11);
        diseaseName[11] = getString(R.string.dname_12);
        diseaseName[12] = getString(R.string.dname_13);
        diseaseName[13] = getString(R.string.dname_14);
        diseaseName[14] = getString(R.string.dname_15);
        diseaseName[15] = getString(R.string.dname_16);
        diseaseName[16] = getString(R.string.dname_17);
        diseaseName[17] = getString(R.string.dname_18);
        diseaseName[18] = getString(R.string.dname_19);
        diseaseName[19] = getString(R.string.dname_20);
        diseaseName[20] = getString(R.string.dname_21);
        diseaseName[21] = getString(R.string.dname_22);
        diseaseName[22] = getString(R.string.dname_23);
        diseaseName[23] = getString(R.string.dname_24);
        diseaseName[24] = getString(R.string.dname_25);
        diseaseName[25] = getString(R.string.dname_26);
        diseaseName[26] = getString(R.string.dname_27);
        diseaseName[27] = getString(R.string.dname_28);
        diseaseName[28] = getString(R.string.dname_29);
        diseaseName[29] = getString(R.string.dname_30);
        diseaseName[30] = getString(R.string.dname_31);
        diseaseName[31] = getString(R.string.dname_32);
        diseaseName[32] = getString(R.string.dname_33);
        diseaseName[33] = getString(R.string.dname_34);
        diseaseName[34] = getString(R.string.dname_35);
        diseaseName[35] = getString(R.string.dname_36);
        diseaseName[36] = getString(R.string.dname_37);
        diseaseName[37] = getString(R.string.dname_38);
        diseaseName[38] = getString(R.string.dname_39);
    }

    String load_setting() {
        SharedPreferences mySharedPreference = getSharedPreferences(SHARED, MODE_PRIVATE);
        return mySharedPreference.getString(SHARED_APP_LANG, "en");
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.menu, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(@NonNull MenuItem item) {
        Intent intent = null;
        if (item.getItemId() == R.id.op_all_diseases) {
            intent = new Intent(this, AllDiseases.class);
        } else if (item.getItemId() == R.id.op_reports) {
            intent = new Intent(this, Reports.class);
        } else if (item.getItemId() == R.id.op_setting) {
            intent = new Intent(this, Settings.class);
        } else if (item.getItemId() == R.id.op_about) {
            intent = new Intent(this, About.class);
        }

        if (intent != null) {
            startActivity(intent);
        }
        return super.onOptionsItemSelected(item);
    }

    @Override
    public void OnReportCardClick(int position) {
        Intent intent = new Intent(Reports.this, ReportD.class);
        intent.putExtra("Col_id", id.get(position));
        startActivity(intent);
    }
}
