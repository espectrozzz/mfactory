<template>
  <svg ref="barcode"></svg>
</template>

<script setup>
import { ref, watchEffect, h, onMounted } from "vue";
import JsBarcode from "jsbarcode";
import jsPDF from "jspdf";

const barcode = ref(null);

const props = defineProps(["value"]);

const generateBarcode = () => {
  if (barcode.value) {
    JsBarcode(barcode.value, props.value);
  }
};

const exportToPDF = () => {
      generateBarcode();
      const svgElement = barcode.value;
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svg);
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const imgData = canvas.toDataURL('image/png');
        const doc = new jsPDF();
        
        for (let i = 0; i < 4; i++) {
          const x = 10;
          const y = 10 + i * (canvas.height + 10);
          doc.addImage(imgData, 'PNG', x, y);
        }
        doc.save('barcode.pdf');
      };

      img.src = url;
    };

watchEffect(() => {
  generateBarcode();
});
</script>

<style scoped>
input {
  width: 100%;
  margin-bottom: 10px;
  padding: 8px;
  font-size: 16px;
}
button {
  padding: 10px 15px;
  font-size: 16px;
  cursor: pointer;
}
svg {
  margin-top: 20px;
  width: 100%;
  height: auto;
}
</style>
