let model;


// Define the L2 regularizer
class L2 {
    static className = 'L2';

    constructor(config) {
        return tf.regularizers.l1l2(config);
    }
}

tf.serialization.registerClass(L2);

const categories = ["Blight", "Common", "Gray", "Healthy", "Lain-lain"];

// Load the model
async function loadModel() {
    const model = await tf.loadLayersModel('model_js/model.json');
    return model;
}

// Handle image upload and prediction
document.getElementById('file-upload').addEventListener('change', async (event) => {
    const model = await loadModel();
    const outputElement = document.getElementById('output');
    const files = event.target.files;

    // Clear previous output
    outputElement.innerHTML = '';

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        reader.onload = async function(e) {
            const image = new Image();
            image.src = e.target.result;
            image.onload = async function() {
                // Preprocess image similar to Python code
                const tensor = tf.browser.fromPixels(image)
                    .resizeNearestNeighbor([224, 224])
                    .toFloat();
                const expandedTensor = tensor.expandDims(0); // Add batch dimension

                // Predict the class
                const prediction = await model.predict(expandedTensor).data();

                // Get the index of the highest prediction
                const predictionIndex = prediction.indexOf(Math.max(...prediction));

                // Define classes
                const classes = ["Blight", "Common_Rust", "Gray_Leaf_Spot", "Healthy", "Lain-lain"];

                // Display output
                // const predictedClass = classes[predictionIndex];
                // outputElement.innerHTML += `<p>Model output: [${prediction}]<br>${file.name} is ${predictedClass}</p>`;

                // Variabel penjelasan untuk setiap klasifikasi
                const explanations = {
                  "Blight" : "Blight atau hawar daun adalah penyakit yang menyerang daun jagung yang disebabkan oleh jamur atau bakteri. ",
                  "Common_Rust" : "Common Rust atau Karat Daun adalah penyakit pada tanaman jagung yang disebabkan oleh jamur Puccinia sorghi",
                  "Gray_Leaf_Spot" : "Gray Leaf Spot atau Bercak Daun adalah penyakit yang disebabkan oleh jamur.",
                  "Healthy" : "Healthy atau Sehat: Tanaman jagung yang diidentifikasi merupakan tanaman yang sehat.",
                  "Lain-lain" : "Lain-lain: Pastikan gambar yang diunggah adalah daun jagung yang jelas dan dalam kondisi baik."
                };

                // Variabel penanganan untuk setiap klasifikasi
                const treatments = {
                  "Blight": [
                    "1. Identifikasi dan potong bagian daun yang terinfeksi untuk mencegah penyebaran.",
                    "2. Kumpulkan dan musnahkan sisa tanaman yang terinfeksi (jangan dikomposkan).",
                    "3. Semprotkan fungisida berbahan aktif seperti chlorothalonil atau mancozeb sesuai dosis.",
                    "4. Tingkatkan sirkulasi udara di sekitar tanaman dengan menjarangkan jarak tanam.",
                    "5. Hindari penyiraman dari atas (gunakan irigasi tetes jika tersedia)."
                  ],

                  "Common_Rust": [
                    "1. Periksa bagian bawah daun untuk memastikan adanya pustula berwarna cokelat kemerahan.",
                    "2. Hapus dan musnahkan daun yang parah terinfeksi.",
                    "3. Gunakan fungisida berbahan aktif seperti mancozeb, azoxystrobin, atau propiconazole.",
                    "4. Ulangi penyemprotan setiap 7–14 hari tergantung kondisi cuaca dan keparahan.",
                    "5. Lakukan rotasi tanaman untuk mencegah infeksi ulang di musim berikutnya."
                  ],

                  "Gray_Leaf_Spot": [
                    "1. Identifikasi bercak persegi panjang berwarna abu-abu ke coklat pada daun.",
                    "2. Pangkas daun yang menunjukkan gejala awal penyakit.",
                    "3. Semprotkan fungisida yang mengandung strobilurin atau triazole secara merata.",
                    "4. Bersihkan area sekitar tanaman dari sisa-sisa tanaman yang bisa jadi sumber infeksi.",
                    "5. Tanam varietas jagung yang tahan terhadap Gray Leaf Spot jika tersedia."
                  ],

                  "Healthy": [
                    "1. Tidak diperlukan tindakan penanganan.",
                    "2. Lanjutkan penyiraman dan pemupukan rutin.",
                    "3. Periksa secara berkala untuk deteksi dini terhadap gejala penyakit.",
                    "4. Pastikan lingkungan tetap bersih dan tidak terlalu lembap."
                  ],

                  "Lain-lain": [
                    "1. Pastikan gambar yang diunggah adalah daun jagung yang jelas dan fokus.",
                    "2. Hindari gambar yang terlalu gelap, buram, atau menampilkan objek lain selain daun.",
                    "3. Coba unggah ulang gambar dari sudut yang berbeda jika klasifikasi belum jelas.",
                    "4. Konsultasikan dengan pakar tanaman jika gejala tidak dapat diidentifikasi sistem."
                  ]
                };


                // Display output
                const predictedClass = classes[predictionIndex];
                let explanationText = "";
                let treatmentText = "";

                // Memeriksa jika jagung terkena Blight
                if (predictedClass === "Blight") {
                  explanationText = explanations["Blight"];
                  treatmentText = treatments["Blight"];
                } else if (predictedClass === "Common_Rust") {
                  explanationText = explanations["Common_Rust"];
                  treatmentText = treatments["Common_Rust"];
                } else if (predictedClass === "Gray_Leaf_Spot") {
                  explanationText = explanations["Gray_Leaf_Spot"];
                  treatmentText = treatments["Gray_Leaf_Spot"];
                } else if (predictedClass === "Healthy") {
                  explanationText = explanations["Healthy"];
                  treatmentText = treatments["Healthy"];
                }  else if (predictedClass === "Lain-lain") {
                  explanationText = explanations["Lain-lain"];
                  treatmentText = treatments["Lain-lain"];
                }

                function displayTreatmentList(className) {
                  const steps = treatments[className];
                  const container = document.getElementById("treatment-container");
                
                  if (steps && steps.length > 0) {
                    const ol = document.createElement("ol");
                    steps.forEach(step => {
                      const li = document.createElement("li");
                      li.textContent = step;
                      ol.appendChild(li);
                    });
                    container.innerHTML = ""; // Kosongkan dulu
                    container.appendChild(ol);
                  } else {
                    container.innerHTML = "<p>Penanganan tidak tersedia.</p>";
                  }
                }

                outputElement.insertAdjacentHTML('beforeend', `
                  <div class="mt-3">
                      <img src="${e.target.result}" width="224" height="224" class="mt-3 rounded-lg style="object-fit: cover; width: 224px; height: 224px;""/>
                      <p>Image ${file.name} diprediksi: <strong>${predictedClass}</strong></p>
                      <p class="mt-2 text-gray-700">Penjelasan: ${explanationText}</p>
                      <p class="mt-2 text-gray-700">Penanganan:</p>
                      <div id="treatment-container"></div>
                      <p class="text-gray-500"><small>Predicted at: ${new Date().toLocaleString()}</small></p>
                  </div>
                `);
                displayTreatmentList(predictedClass);
            };
        };

        reader.readAsDataURL(file);
    }
});

function displayTreatmentList(className) {
  const steps = treatments[className];
  const container = document.getElementById("treatment-container");

  if (steps && steps.length > 0) {
    const ol = document.createElement("ol");
    steps.forEach(step => {
      const li = document.createElement("li");
      li.textContent = step;
      ol.appendChild(li);
    });
    container.innerHTML = ""; // Kosongkan dulu
    container.appendChild(ol);
  } else {
    container.innerHTML = "<p>Penanganan tidak tersedia.</p>";
  }
}
// #######################################################

// Menangani klik tombol kirim untuk mengirim pertanyaan ke server
document.getElementById('kirim').addEventListener('click', function() {
    const question = document.getElementById('tanya').value;
    
    if (question.trim() === '') {
      alert('Pertanyaan tidak boleh kosong!');
      return;
    }
  
    // Kirim pertanyaan ke server
    fetch('http://127.0.0.1:8081/ask', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: question })
    })
    .then(response => response.json())  // Mengambil respons JSON dari server
    .then(data => {
      // Cek apakah ada jawaban di dalam data yang diterima
      if (data && data.answer && data.answer.parts && data.answer.parts.length > 0) {
        const answerText = data.answer.parts[0].text;

        const convertHTML = marked.parse(answerText)

        document.getElementById('output-bot').innerHTML = convertHTML;
      } else {
        document.getElementById('output-bot').innerText = 'Tidak ada jawaban yang ditemukan.';
      }
    })
    .catch(error => {
      console.error('Error:', error);
      document.getElementById('output-bot').innerText = 'Terjadi kesalahan saat mendapatkan jawaban.';
    });
  });
  
// ##################################################################
// Try API
// Handle image upload and prediction
// Handle image upload and prediction
document.getElementById('file-upload-api').addEventListener('change', async (event) => {
  const apiUrl = "https://corn-294422226808.asia-southeast2.run.app/predict"; // URL API
  const outputElement = document.getElementById('output-api');
  const files = event.target.files;

  // Clear previous output
  outputElement.innerHTML = '';

  for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      
      // Append file with key `image` and rename it to `gambar.jpg`
      formData.append('image', file, 'gambar.jpg'); 

      try {
          // Kirim gambar ke API
          const response = await fetch(apiUrl, {
              method: 'POST',
              body: formData,
          });

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          // Ambil data dari respons
          const { status, data } = result;
          if (status !== "success") {
              throw new Error("API response status is not success");
          }

          const { result: predictedClass, suggestion, createdAt } = data;

          // Tampilkan output
          outputElement.insertAdjacentHTML('beforeend', `
              <div class="mt-3">
                  <img src="${URL.createObjectURL(file)}" width="224" height="224" class="mt-3 rounded-lg" style="object-fit: cover;"/>
                  <p><strong>Predicted Result:</strong> ${predictedClass}</p>
                  <p><strong>Suggestion:</strong> ${suggestion}</p>
                  <p class="text-gray-500"><small>Predicted at: ${new Date(createdAt).toLocaleString()}</small></p>
              </div>
          `);
      } catch (error) {
          console.error("Error processing file:", file.name, error);
          outputElement.insertAdjacentHTML('beforeend', `
              <p class="text-red-500">Error processing file: ${file.name}</p>
          `);
      }
  }
});



