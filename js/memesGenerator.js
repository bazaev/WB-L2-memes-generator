// Получаем необходимые элементы
const $ = {
	canvas: document.getElementById('canvas'),
	upload: document.getElementById('upload'),
	file: document.getElementById('upload__input'),
	generate: document.getElementById('generate'),
	clear: document.getElementById('clear'),
	text: document.getElementById('text'),
}

// Резервируем переменную для файла
let _file;

const fileHandler = (file) => {
	$.canvas.style.display = 'block';
	$.upload.style.display = 'none';
	const fileReader = new FileReader();

	fileReader.onload = () => {
		const img = new Image();
		img.src = fileReader.result;
		img.onload = () => {
			img.style.maxWidth = "400px";
			img.style.maxHeight = "400px";
			$.canvas.appendChild(img);
		}
	}
	_file = file;
	fileReader.readAsDataURL(file);
}

$.file.addEventListener('change', () => {
	if (!$.file.files) { return }
	const file = $.file.files[0];
	fileHandler(file);
});

$.upload.addEventListener('dragenter', (event) => {
	event.preventDefault();
	$.upload.classList.add('hover');
})

$.upload.addEventListener('dragleave', (event) => {
	event.preventDefault();
	$.upload.classList.remove('hover');
})

$.upload.addEventListener('drop', (event) => {
	event.preventDefault();
	$.upload.classList.remove('hover');
	const file = event.dataTransfer.files[0];
	if (file) {
		fileHandler(file);
	}
})


const textMoveHandler = function(event) {
	event.preventDefault();
	if (event.target === $.canvas) {
		this.style.left = event.layerX + 'px';
		this.style.top = event.layerY + 'px';
	}
}

$.clear.addEventListener('click', () => {
	$.canvas.innerHTML = '';
	$.text.innerHTML = '';
	$.canvas.style.display = 'none';
	$.upload.style.display = '';
	_file = null;
})

// Обработчик для перемещения текста
$.canvas.addEventListener('mousedown', (event) => {
	event.preventDefault();
	if (event.target.classList.contains('canvas__text')) {
		let timeOut;

		const handler = textMoveHandler.bind(event.target);

		const endHandler = () => {
			event.preventDefault();

			if (timeOut) {
				clearTimeout(timeOut)
			}
			
			$.canvas.classList.remove('move');
			$.canvas.removeEventListener('mousemove', handler)
			$.canvas.removeEventListener('mouseup', endHandler)
			$.canvas.removeEventListener('mouseleave', endHandler)
		}
		
		$.canvas.addEventListener('mouseup', endHandler)
		
		$.canvas.addEventListener('mouseleave', endHandler)

		if (timeOut) {
			clearTimeout(timeOut)
		}

		timeOut = setTimeout(()=>{
			$.canvas.classList.add('move');
			$.canvas.addEventListener('mousemove', handler)
		}, 150);
	}
})

// Обработчик для добавления текста
$.canvas.addEventListener('mousedown', (event) => {
	if (event.target.classList.contains('canvas__text')) {
		return
	}

	const defaultText = "Текст";

	const container = document.createElement('div');
	container.classList.add('text__container');

	const row = document.createElement('div');
	row.classList.add('text__row');

	const actions = row.cloneNode();

	const input = document.createElement('input');
	input.classList.add('text__input');
	input.type = 'text';
	input.autocomplete = 'off';
	input.value = defaultText;

	const text = document.createElement('div');
	text.classList.add('canvas__text');
	text.style.position = 'absolute';
	text.style.left = event.layerX + 'px';
	text.style.top = event.layerY + 'px';
	text.style.fontSize = 16 + 'px';
	text.style.color = '#000';
	text.textContent = defaultText;

	const button = document.createElement('button');
	button.classList.add('text__remove');
	button.textContent = "X";

	const bold = document.createElement('button');
	bold.classList.add('text__bold');
	bold.textContent = "B";

	const italic = document.createElement('button');
	italic.classList.add('text__italic');
	italic.textContent = "I";

	const color = document.createElement('input');
	color.classList.add('text__color');
	color.type = 'color';
	color.value = text.style.color;

	const fontSize = document.createElement('input');
	fontSize.classList.add('text__font-size');
	fontSize.type = 'number';
	fontSize.value = parseInt(text.style.fontSize);
	fontSize.width = 50;

	input.addEventListener('input', () => {
		text.innerText = input.value;
	})

	text.addEventListener('input', () => {
		input.value = text.textContent;
	})

	text.addEventListener('click', () => {
		input.focus();
	})

	button.addEventListener('click', () => {
		container.remove();
		text.remove();
	})

	bold.addEventListener('click', () => {
		if (text.style.fontWeight === 'bold') {
			text.style.fontWeight = 'normal';
			bold.classList.remove('active');
		} else {
			text.style.fontWeight = 'bold';
			bold.classList.add('active');
		}
	})

	italic.addEventListener('click', () => {
		if (text.style.fontStyle === 'italic') {
			text.style.fontStyle = 'normal';
			italic.classList.remove('active');
		} else {
			text.style.fontStyle = 'italic';
			italic.classList.add('active');
		}
	})

	color.addEventListener('input', () => {
		text.style.color = color.value;
	})

	fontSize.addEventListener('input', () => {
		text.style.fontSize = fontSize.value + 'px';
	})

	row.appendChild(input);
	row.appendChild(button);

	actions.appendChild(bold);
	actions.appendChild(italic);
	actions.appendChild(color);
	actions.appendChild(fontSize);

	container.appendChild(row);
	container.appendChild(actions);

	$.text.appendChild(container);

	$.canvas.appendChild(text);
});

$.generate.addEventListener('click', () => {
	if (!_file) {
		return
	}
	
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");
	const image = $.canvas.children[0];

	const textPaddingTop = 8;
	const textPaddingLeft = 12;
	const totalBorderWidth = 2;

	// Получим коэффициент масштабирования
	const scale = image.naturalWidth / image.width;

	// Установим размеры canvas такие же, как у изображения
	canvas.width = image.naturalWidth;
	canvas.height = image.naturalHeight;

	// Установим свойства для улучшения качества изображения и текста
	ctx.imageSmoothingEnabled = true;
	ctx.imageSmoothingQuality = "high";

	// Отрисуем изображение на canvas
	ctx.drawImage(image, 0, 0);

	const textBlocks = document.querySelectorAll(".canvas__text");

	textBlocks.forEach(function (textBlock) {
		const text = textBlock.textContent;
		const offsetOfCenter = textBlock.offsetWidth / 2;
		let left = (parseInt(textBlock.style.left || 0) * scale) + textPaddingLeft - totalBorderWidth - offsetOfCenter;
		let top = (parseInt(textBlock.style.top || 0) * scale) + textPaddingTop - totalBorderWidth;

		// Получим свойства текста из стилей блока
		const fontSize = window.getComputedStyle(textBlock).fontSize;
		const fontFamily = window.getComputedStyle(textBlock).fontFamily;
		const fontWeight = window.getComputedStyle(textBlock).fontWeight;
		const fontStyle = window.getComputedStyle(textBlock).fontStyle;
		const textColor = window.getComputedStyle(textBlock).color;
		let textDecoration = window.getComputedStyle(textBlock).textDecoration;
		textDecoration = textDecoration.split(' ');

		const letterSpacing = 1;

		if (fontWeight > 500) {
			left -= 1;
		}

		// Определяем свойства текста
		ctx.font = fontStyle + " " + fontWeight + " " + fontSize + " " + fontFamily;
		ctx.fillStyle = textColor;
		ctx.textAlign = "left";
		ctx.textDecoration = textDecoration;

		let width = 0;
		for (let i = 0; i < text.length; i++) {
			ctx.fillText(text[i], left, top);
			const textWidth = ctx.measureText(text[i]).width + letterSpacing;
			width += textWidth;
			left += textWidth;
		}
	});

	// Скачиваем изображение
	const fileName = _file.name.replace(/(\..*)$/, "_MG$1");
	const a = document.createElement("a");
	a.href = canvas.toDataURL(_file.type);
	a.download = fileName;
	a.click();
})
