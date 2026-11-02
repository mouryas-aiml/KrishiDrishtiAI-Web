package com.example.plantai;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.pdf.PdfDocument;
import android.net.Uri;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Log;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class PdfExportHelper {
    private static final String TAG = "PdfExportHelper";

    public static String exportCropReport(Context context, String diseaseName, String confidenceStr,
                                          String dateStr, String symptomsStr, String treatmentStr) {
        PdfDocument pdfDocument = new PdfDocument();
        PdfDocument.PageInfo pageInfo = new PdfDocument.PageInfo.Builder(595, 842, 1).create(); // A4 size
        PdfDocument.Page page = pdfDocument.startPage(pageInfo);

        Canvas canvas = page.getCanvas();
        Paint paint = new Paint();

        // Header Background Bar (Deep Forest Green)
        paint.setColor(Color.parseColor("#1B4D3E"));
        canvas.drawRect(0, 0, 595, 100, paint);

        // Header Title
        paint.setColor(Color.WHITE);
        paint.setTextSize(22);
        paint.setFakeBoldText(true);
        canvas.drawText("KRISHI DRISHTI (ಕೃಷಿ ದೃಷ್ಟಿ)", 30, 45, paint);

        paint.setTextSize(12);
        paint.setFakeBoldText(false);
        canvas.drawText("AI Crop Health & Diagnosis Report", 30, 70, paint);

        // Report Date
        paint.setColor(Color.parseColor("#1A2521"));
        paint.setTextSize(12);
        canvas.drawText("Generated on: " + (dateStr != null ? dateStr : getCurrentDate()), 30, 130, paint);

        // Divider Line
        paint.setColor(Color.parseColor("#2E7D32"));
        paint.setStrokeWidth(2);
        canvas.drawLine(30, 145, 565, 145, paint);

        // Disease Section
        paint.setColor(Color.parseColor("#1B4D3E"));
        paint.setTextSize(16);
        paint.setFakeBoldText(true);
        canvas.drawText("Diagnosis Summary", 30, 180, paint);

        paint.setColor(Color.parseColor("#1A2521"));
        paint.setTextSize(14);
        paint.setFakeBoldText(false);
        canvas.drawText("Detected Disease: " + (diseaseName != null ? diseaseName : "Healthy Crop"), 30, 210, paint);
        canvas.drawText("AI Confidence Score: " + (confidenceStr != null ? confidenceStr : "High"), 30, 235, paint);

        // Symptoms Section
        paint.setColor(Color.parseColor("#1B4D3E"));
        paint.setTextSize(16);
        paint.setFakeBoldText(true);
        canvas.drawText("Observed Symptoms & Causes", 30, 280, paint);

        paint.setColor(Color.parseColor("#1A2521"));
        paint.setTextSize(12);
        paint.setFakeBoldText(false);
        drawWrappedText(canvas, paint, symptomsStr != null ? symptomsStr : "No symptoms reported.", 30, 305, 535);

        // Treatment & Prevention Section
        paint.setColor(Color.parseColor("#1B4D3E"));
        paint.setTextSize(16);
        paint.setFakeBoldText(true);
        canvas.drawText("Smart Treatment & Biological Guidance", 30, 420, paint);

        paint.setColor(Color.parseColor("#1A2521"));
        paint.setTextSize(12);
        paint.setFakeBoldText(false);
        drawWrappedText(canvas, paint, treatmentStr != null ? treatmentStr : "Maintain regular irrigation and balanced nutrients.", 30, 445, 535);

        // Footer
        paint.setColor(Color.parseColor("#5A6B65"));
        paint.setTextSize(10);
        canvas.drawText("Krishi Drishti — Empowering Farmers with AI Technology 🌾", 150, 800, paint);

        pdfDocument.finishPage(page);

        // Save PDF
        String fileName = "KrishiDrishti_Report_" + System.currentTimeMillis() + ".pdf";
        try {
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
                ContentValues values = new ContentValues();
                values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
                values.put(MediaStore.MediaColumns.MIME_TYPE, "application/pdf");
                values.put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/KrishiDrishti");

                ContentResolver resolver = context.getContentResolver();
                Uri uri = resolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values);
                if (uri != null) {
                    try (OutputStream out = resolver.openOutputStream(uri)) {
                        pdfDocument.writeTo(out);
                    }
                    pdfDocument.close();
                    return "Saved to Downloads/KrishiDrishti/" + fileName;
                }
            } else {
                File file = new File(Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_DOWNLOADS), fileName);
                try (FileOutputStream out = new FileOutputStream(file)) {
                    pdfDocument.writeTo(out);
                }
                pdfDocument.close();
                return file.getAbsolutePath();
            }
        } catch (Exception e) {
            Log.e(TAG, "Failed to export PDF", e);
        }
        pdfDocument.close();
        return null;
    }

    private static void drawWrappedText(Canvas canvas, Paint paint, String text, float x, float y, float width) {
        String[] lines = text.split("\n");
        float currentY = y;
        for (String line : lines) {
            if (paint.measureText(line) < width) {
                canvas.drawText(line, x, currentY, paint);
                currentY += 18;
            } else {
                String[] words = line.split(" ");
                StringBuilder sb = new StringBuilder();
                for (String word : words) {
                    if (paint.measureText(sb.toString() + " " + word) < width) {
                        sb.append(" ").append(word);
                    } else {
                        canvas.drawText(sb.toString().trim(), x, currentY, paint);
                        sb = new StringBuilder(word);
                        currentY += 18;
                    }
                }
                if (sb.length() > 0) {
                    canvas.drawText(sb.toString().trim(), x, currentY, paint);
                    currentY += 18;
                }
            }
        }
    }

    private static String getCurrentDate() {
        return new SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault()).format(new Date());
    }
}
