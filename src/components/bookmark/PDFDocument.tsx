import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { BookmarkItem } from '@/src/types';
import { PDFTemplate } from './PDFTemplates';

// Register Unicode-supported fonts for flawless Vietnamese text rendering
Font.register({
  family: 'Roboto',
  fonts: [
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf', fontWeight: 'normal' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf', fontWeight: 'bold' },
    { src: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf', fontStyle: 'italic' }
  ]
});

Font.register({
  family: 'PlayfairDisplay',
  src: 'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZcxv_7WUr8xs68FsgvM-p_V.ttf',
  fontWeight: 'bold'
});

// Modern Styles (Amber & Charcoal, creative grid)
const modernStyles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#FAF8F5', fontFamily: 'Roboto', fontSize: 10, color: '#334155' },
  header: { borderBottom: '2 solid #78350F', paddingBottom: 12, marginBottom: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  title: { fontSize: 24, color: '#78350F', fontFamily: 'PlayfairDisplay', fontWeight: 'bold', marginBottom: 4 },
  category: { fontSize: 10, color: '#D97706', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  metaItem: { fontSize: 9, color: '#64748B' },
  body: { flexDirection: 'row', gap: 20 },
  leftCol: { width: '55%', flexDirection: 'column', gap: 12 },
  rightCol: { width: '40%', flexDirection: 'column', gap: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#78350F', borderBottom: '1 solid #E2E8F0', paddingBottom: 4, marginBottom: 6 },
  description: { lineHeight: 1.5, color: '#475569' },
  imageContainer: { borderRadius: 8, overflow: 'hidden', border: '1 solid #E2E8F0', backgroundColor: '#F1F5F9', marginBottom: 12 },
  image: { width: '100%', height: 200, objectFit: 'cover' },
  bulletList: { marginTop: 4 },
  bulletItem: { flexDirection: 'row', gap: 6, marginBottom: 4, lineHeight: 1.4 },
  bulletDot: { width: 4, height: 4, backgroundColor: '#D97706', borderRadius: 2, marginTop: 4 },
  textBold: { fontWeight: 'bold', color: '#1E293B' },
  noteBox: { backgroundColor: '#FEF3C7', borderLeft: '4 solid #D97706', padding: 10, borderRadius: 4, marginTop: 10 },
  noteText: { fontStyle: 'italic', color: '#78350F', lineHeight: 1.4 },
  reminderBox: { backgroundColor: '#EFF6FF', borderLeft: '4 solid #3B82F6', padding: 8, borderRadius: 4, marginTop: 6 },
  reminderText: { color: '#1E40AF', fontSize: 9 },
  aiBadge: { backgroundColor: '#F59E0B', color: '#FFFFFF', fontSize: 8, fontWeight: 'bold', padding: '2 6', borderRadius: 10, marginTop: 4, alignSelf: 'flex-start' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1 solid #E2E8F0', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', color: '#94A3B8', fontSize: 8 }
});

// Classic Styles (Serif, warm ivory tint, academic layout)
const classicStyles = StyleSheet.create({
  page: { padding: 48, backgroundColor: '#FAF6F0', fontFamily: 'Roboto', fontSize: 10, color: '#2B2625' },
  header: { borderBottom: '1 solid #5C3D2E', paddingBottom: 14, marginBottom: 20, textAlign: 'center' },
  headerRow: { flex: 1, alignItems: 'center' },
  title: { fontSize: 22, color: '#5C3D2E', fontFamily: 'PlayfairDisplay', fontWeight: 'bold', marginBottom: 6 },
  category: { fontSize: 9, color: '#855843', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 2 },
  metaItem: { fontSize: 9, color: '#786865', fontStyle: 'italic', marginTop: 2 },
  body: { flexDirection: 'column', gap: 15 },
  leftCol: { width: '100%', flexDirection: 'column', gap: 12 },
  rightCol: { width: '100%', flexDirection: 'column', gap: 12 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#5C3D2E', textTransform: 'uppercase', borderBottom: '1 solid #D9C3B0', paddingBottom: 3, marginBottom: 6, letterSpacing: 0.5 },
  description: { lineHeight: 1.6, color: '#3A3332', textAlign: 'justify' },
  imageContainer: { border: '1 solid #D9C3B0', padding: 4, backgroundColor: '#FFFFFF', alignSelf: 'center', marginBottom: 15 },
  image: { width: 320, height: 180, objectFit: 'cover' },
  bulletList: { marginTop: 4 },
  bulletItem: { flexDirection: 'row', gap: 6, marginBottom: 4, lineHeight: 1.4 },
  bulletDot: { width: 4, height: 4, backgroundColor: '#855843', borderRadius: 2, marginTop: 4 },
  textBold: { fontWeight: 'bold', color: '#1A1412' },
  noteBox: { border: '1 solid #D9C3B0', borderStyle: 'dashed', padding: 12, marginTop: 10, backgroundColor: '#FDFBF7' },
  noteText: { fontStyle: 'italic', color: '#5C3D2E', lineHeight: 1.5 },
  reminderBox: { border: '1 dashed #93C5FD', padding: 8, marginTop: 8, backgroundColor: '#F0F7FF' },
  reminderText: { color: '#1E3A8A', fontSize: 9 },
  aiBadge: { border: '1 solid #855843', color: '#855843', fontSize: 7, fontWeight: 'bold', padding: '1 5', alignSelf: 'center', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  footer: { position: 'absolute', bottom: 35, left: 48, right: 48, borderTop: '0.5 solid #D9C3B0', paddingTop: 10, flexDirection: 'row', justifyContent: 'space-between', color: '#9E8E8B', fontSize: 8 }
});

// Minimal Styles (Perfect clean white, highly structured grid)
const minimalStyles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#FFFFFF', fontFamily: 'Roboto', fontSize: 9.5, color: '#1F2937' },
  header: { borderBottom: '1 solid #E5E7EB', paddingBottom: 10, marginBottom: 18 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 20, color: '#111827', fontWeight: 'bold', marginBottom: 3 },
  category: { fontSize: 9, color: '#4B5563', fontWeight: 'bold', textTransform: 'uppercase' },
  metaItem: { fontSize: 8.5, color: '#9CA3AF' },
  body: { flexDirection: 'row', gap: 24 },
  leftCol: { width: '58%', flexDirection: 'column', gap: 10 },
  rightCol: { width: '38%', flexDirection: 'column', gap: 10 },
  sectionTitle: { fontSize: 10.5, fontWeight: 'bold', color: '#111827', borderBottom: '1 solid #F3F4F6', paddingBottom: 3, marginBottom: 5 },
  description: { lineHeight: 1.5, color: '#374151' },
  imageContainer: { overflow: 'hidden', border: '1 solid #F3F4F6', marginBottom: 10 },
  image: { width: '100%', height: 180, objectFit: 'cover' },
  bulletList: { marginTop: 3 },
  bulletItem: { flexDirection: 'row', gap: 6, marginBottom: 3, lineHeight: 1.4 },
  bulletDot: { width: 3, height: 3, backgroundColor: '#4B5563', borderRadius: 1.5, marginTop: 4 },
  textBold: { fontWeight: 'bold', color: '#111827' },
  noteBox: { backgroundColor: '#F9FAFB', borderLeft: '2 solid #4B5563', padding: 8, marginTop: 8 },
  noteText: { color: '#374151', lineHeight: 1.4 },
  reminderBox: { backgroundColor: '#F3F4F6', borderLeft: '2 solid #9CA3AF', padding: 6, marginTop: 6 },
  reminderText: { color: '#4B5563', fontSize: 8.5 },
  aiBadge: { border: '1 solid #E5E7EB', color: '#6B7280', fontSize: 7.5, padding: '1 4', marginTop: 4, alignSelf: 'flex-start' },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1 solid #F3F4F6', paddingTop: 8, flexDirection: 'row', justifyContent: 'space-between', color: '#9CA3AF', fontSize: 7.5 }
});

interface PDFDocumentProps {
  bookmark: BookmarkItem;
  template?: PDFTemplate;
}

export const PDFDocument = React.memo(function PDFDocument({ bookmark, template = 'modern' }: PDFDocumentProps) {
  const getStyles = (tmp: PDFTemplate) => {
    switch (tmp) {
      case 'classic':
        return classicStyles;
      case 'minimal':
        return minimalStyles;
      default:
        return modernStyles;
    }
  };

  const styles = getStyles(template);

  // Helper clean tag logic (handling list or other formats safely)
  const cleanTags = bookmark.tags || [];

  return (
    <Document title={`CulturalVault - ${bookmark.title}`}>
      <Page size="A4" style={styles.page}>
        {/* Header Block */}
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.category}>{bookmark.category || 'Di Sản Văn Hóa'}</Text>
              <Text style={styles.title}>{bookmark.title}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {bookmark.year && <Text style={styles.metaItem}>Thời đại: {bookmark.year > 0 ? `Năm ${bookmark.year}` : `${Math.abs(bookmark.year)} TCN`}</Text>}
              {bookmark.location && <Text style={styles.metaItem}>Nơi lưu trữ: {bookmark.location}</Text>}
            </View>
          </View>
        </View>

        {/* Content Body Block */}
        <View style={styles.body}>
          {/* Cột Trái: Ảnh và Các thuộc tính cơ bản */}
          <View style={styles.leftCol}>
            {bookmark.imageUrl && (
              <View style={styles.imageContainer}>
                <Image src={bookmark.imageUrl} style={styles.image} />
              </View>
            )}

            <Text style={styles.sectionTitle}>Mô Tả Di Sản</Text>
            <Text style={styles.description}>{bookmark.description}</Text>

            {bookmark.rating && (
              <Text style={[styles.metaItem, { marginTop: 6 }]}>
                Đánh giá mức độ quan trọng: <Text style={styles.textBold}>{bookmark.rating}/5 sao</Text>
              </Text>
            )}

            {bookmark.isAIRestored && (
              <View style={styles.aiBadge}>
                <Text>✨ ĐÃ PHỤC DỰNG BẰNG AI</Text>
              </View>
            )}
          </View>

          {/* Cột Phải: Kết quả phân tích AI, Ghi chú cá nhân, Nhắc nhở */}
          <View style={styles.rightCol}>
            {bookmark.recognition && (
              <>
                <Text style={styles.sectionTitle}>Phân Tích Chi Tiết AI</Text>
                <View style={styles.bulletList}>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text><Text style={styles.textBold}>Tên nhận diện:</Text> {bookmark.recognition.objectName || 'N/A'}</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text><Text style={styles.textBold}>Nền văn hóa:</Text> {bookmark.recognition.culture || 'N/A'}</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text><Text style={styles.textBold}>Niên đại dực kiến:</Text> {bookmark.recognition.period || 'N/A'}</Text>
                  </View>
                  <View style={styles.bulletItem}>
                    <View style={styles.bulletDot} />
                    <Text><Text style={styles.textBold}>Độ tin cậy:</Text> {(bookmark.recognition.confidence * 100).toFixed(1)}%</Text>
                  </View>
                </View>
              </>
            )}

            {/* Tags section */}
            {cleanTags.length > 0 && (
              <>
                <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Tags phân loại</Text>
                <Text style={{ fontSize: 9, fontStyle: 'italic', color: '#4B5563' }}>
                  {cleanTags.join(', ')}
                </Text>
              </>
            )}

            {/* Ghi chú cá nhân */}
            {bookmark.note ? (
              <View style={styles.noteBox}>
                <Text style={{ fontSize: 9, fontWeight: 'bold', color: styles.noteText.color, marginBottom: 3 }}>GHI CHÚ CÁ NHÂN</Text>
                <Text style={styles.noteText}>{bookmark.note}</Text>
              </View>
            ) : null}

            {/* Nhắc nhở */}
            {bookmark.reminder && !bookmark.reminder.completed ? (
              <View style={styles.reminderBox}>
                <Text style={{ fontSize: 8.5, fontWeight: 'bold', color: styles.reminderText.color, marginBottom: 2 }}>⏰ LỊCH NHẮC KHẢO CỨU</Text>
                <Text style={styles.reminderText}>
                  Thời gian: {new Date(bookmark.reminder.date).toLocaleString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
                {bookmark.reminder.note && (
                  <Text style={[styles.reminderText, { marginTop: 2, fontStyle: 'italic' }]}>
                    Nội dung: {bookmark.reminder.note}
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>Cổng nghiên cứu bảo vật di sản CulturalVault</Text>
          <Text>Ngày xuất: {new Date().toLocaleDateString('vi-VN')} • Bản quyền thuộc người dùng cá nhân</Text>
        </View>
      </Page>
    </Document>
    );
});
