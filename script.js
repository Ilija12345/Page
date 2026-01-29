document.addEventListener('DOMContentLoaded', () => {
	const bgCollage = document.getElementById('bgCollage');
	const collageImages = [
		'images/4E37AF25-079F-4271-B6E9-D5EBA565673C.jpg',
		'images/98A7F42A-C78A-4D50-B6CF-F7658C262198.jpg',
		'images/9E420C69-F9A3-4AF5-9475-B62FE359481A.jpg',
		'images/E14DCFC2-4EFD-4546-B16A-05FA89670B58.jpg',
		'images/E6BE8222-079F-4DFB-BAC6-0162CC06AC37.jpg',
		'images/F07FA9F1-F7BA-4880-9299-69465B941E00.jpg',
		'images/F850A9FC-14D1-45D4-B185-F37616653CED.jpg',
		'images/IMG_6529.PNG',
		'images/IMG_6539.PNG',
		'images/IMG_6676.PNG'
	];

	const rand = (min, max) => min + Math.random() * (max - min);
	const intersects = (a, b, pad = 0) => {
		return !(
			a.x + a.w + pad < b.x ||
			a.x > b.x + b.w + pad ||
			a.y + a.h + pad < b.y ||
			a.y > b.y + b.h + pad
		);
	};

	const scatterCollage = () => {
		if (!bgCollage) return;
		bgCollage.innerHTML = '';

		const vw = window.innerWidth;
		const vh = window.innerHeight;
		const padding = 18;
		const cx = vw / 2;
		const cy = vh / 2;
		// Avoid the center area where the card sits.
		const avoidW = Math.min(460, vw * 0.62);
		const avoidH = Math.min(360, vh * 0.48);

		// Smaller images on phones, and fewer images so they don't overlap.
		const minSide = Math.min(vw, vh);
		const isPhone = minSide <= 520;
		const sizeMin = isPhone ? 140 : 200;
		const sizeMax = isPhone ? 190 : 290;
		const maxImages = isPhone ? Math.min(7, collageImages.length) : collageImages.length;
		const placed = [];
		const pad = isPhone ? 10 : 14;

		for (const src of collageImages.slice(0, maxImages)) {
			const img = document.createElement('img');
			img.src = src;
			img.alt = '';
			img.loading = 'lazy';
			img.decoding = 'async';
			img.className = 'bg-item';

			const w = Math.round(rand(sizeMin, sizeMax));
			// Approximate height for collision checks (photos are usually not square).
			const h = Math.round(w * rand(0.72, 0.92));
			const r = rand(-14, 14).toFixed(2);
			img.style.setProperty('--w', `${w}px`);
			img.style.setProperty('--r', `${r}deg`);

			let x = 0;
			let y = 0;
			let tries = 0;
			while (tries < 120) {
				x = Math.round(rand(padding, Math.max(padding, vw - w - padding)));
				y = Math.round(rand(padding, Math.max(padding, vh - h - padding)));
				const insideCenter =
					Math.abs((x + w / 2) - cx) < avoidW / 2 &&
					Math.abs((y + h / 2) - cy) < avoidH / 2;

				const rect = { x, y, w, h };
				const overlaps = placed.some((p) => intersects(rect, p, pad));
				if (!insideCenter && !overlaps) {
					placed.push(rect);
					break;
				}
				tries++;
			}

			// If we couldn't find a perfect spot, place it anyway (rare on tiny screens).
			if (tries >= 120) {
				placed.push({ x, y, w, h });
			}

			img.style.left = `${x}px`;
			img.style.top = `${y}px`;
			bgCollage.appendChild(img);
		}
	};

	// Initial scatter
	scatterCollage();
	window.addEventListener('resize', () => {
		// Simple re-scatter on resize so things stay nicely placed.
		scatterCollage();
	});

	const yesBtn = document.getElementById('yesBtn');
	const noBtn = document.getElementById('noBtn');
	const buttons = document.getElementById('buttons');
	const result = document.getElementById('result');

	// If someone opens lorena.html (redirect shell), these won't exist.
	if (!yesBtn || !noBtn || !result) return;

	const noTexts = [
		'Ne',
		'Jesi sigurna?',
		'Jesi jako sigurna?',
		'Stvarno stvarno sigurna?',
		'100% stvarno stvarno stvarno sigurna?'
	];

	let noIndex = 0;
	let yesScale = 1;
	let lockedFullscreen = false;

	const setYesScale = (scale) => {
		yesScale = scale;
		document.documentElement.style.setProperty('--yes-scale', String(yesScale));
	};

	const showResult = (text) => {
		result.textContent = text;
		result.classList.remove('show');
		// Restart animation
		void result.offsetWidth;
		result.classList.add('show');
	};

	const enterFullscreenYesMode = () => {
		lockedFullscreen = true;
		document.body.classList.add('yes-fullscreen');
		noBtn.style.display = 'none';
		setYesScale(1);
	};

	noBtn.addEventListener('click', () => {
		if (lockedFullscreen) return;

		noIndex = Math.min(noIndex + 1, noTexts.length - 1);
		noBtn.textContent = noTexts[noIndex];

		// Grow Yes each time No is clicked.
		// Tune: fast enough to feel silly, not instant.
		setYesScale(Math.min(1 + noIndex * 1.35, 4.2));

		// On the last iteration ("100% sure?"), remove No and make Yes fill the screen.
		if (noIndex === noTexts.length - 1) {
			enterFullscreenYesMode();
		}
	});

	yesBtn.addEventListener('click', () => {
		document.body.classList.add('accepted');
		showResult('Znao sam da ćeš reći da!');
		scatterCollage();

		// Immediately hide the choices once Yes is clicked.
		if (buttons) buttons.style.display = 'none';

		// In the final state (giant Yes), clicking Yes should remove the button
		// and show the message.
		if (lockedFullscreen) {
			yesBtn.style.display = 'none';
			return;
		}
		// Keep the non-fullscreen layout; the message is now the focus.
		setYesScale(1);
	});
});
