@charset "UTF-8";
function copiarCodigo() {
  // Seleciona o elemento de código
  const codigo = document.querySelector('.bloco-codigo code');
  
  // Cria uma área de texto temporária
  const tempTextArea = document.createElement('textarea');
  tempTextArea.value = codigo.textContent.trim(); // Pega o texto e remove espaços extras
  document.body.appendChild(tempTextArea);
  
  // Seleciona e copia o texto
  tempTextArea.select();
  document.execCommand('copy');
  
  // Remove a área de texto temporária
  document.body.removeChild(tempTextArea);
  
  // Opcional: Alerta para o usuário
  alert('Código copiado para a área de transferência!');
}