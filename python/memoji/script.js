'use strict';

const opened  = 'opened';
const success = 'success';
const failure = 'failure';
const WinMsg  = 'Win';
const LoseMsg = 'Lose';
const WinBtn  = 'Play again';
const LoseBtn = 'Try again';
const cardsCount = 12;

class Game {
	constructor() {};

	ArrangeEmojiByCards() {
		function getEmojiIndexes() {
			function shuffle(array) {
				let counter = array.length;
				while (counter > 0) {
					let index = Math.floor(Math.random() * counter);
					counter--;
					// swap the last element with it
					let temp = array[counter];
					array[counter] = array[index];
					array[index] = temp;
				}
				return array;
			};

			return shuffle([1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6]);
		};

		let emojiIndexes = getEmojiIndexes();

		function setEmoji(idx) {
			let cssSelector = '#card' + idx + ' .card__face--back';
			let element = document.querySelector(cssSelector);

			// remove previous emoji, if exists
			let previousEmoji = '';
			for (let i = 0; i < element.classList.length; i++) {
				if (element.classList.item(i).startsWith('emoji')) {
					previousEmoji = element.classList.item(i);
				};
			}
			if (previousEmoji) element.classList.remove(previousEmoji);

			// add new generated emoji
			let emojiIndex = emojiIndexes.shift();
			element.classList.add('emoji' + emojiIndex);
		};

		let cardIndex = 1;
		while (emojiIndexes.length > 0) {
			setEmoji(cardIndex); // first of pair
			setEmoji(cardIndex + 1); // second of pair
			cardIndex += 2;
		}
	};

	IsBeforeStart() {
		let openedCards = document.getElementsByClassName(opened);
		return openedCards.length === 0;
	};

	Start(game) {
		game.ArrangeEmojiByCards();
		const oneSecond = new Date(2000, 0, 1, 0, 0, 1, 0);
		this.timerId = setInterval(function() {
			let timeValues = document.getElementById('timer').innerHTML.split(':');
			let minute = Number(timeValues[0]);
			let second = Number(timeValues[1]);
			if (minute === 0 && second === 0) {
				game.Stop(LoseMsg);
				return;
			}
			let newdate = new Date(2000, 0, 1, 0, minute, second - 1, 0);
			
			let addLeadingZero = function(value) {
				let strValue = value.toString();
				return strValue.length === 1 ? '0' + strValue : strValue;
			}
			document.getElementById('timer').innerHTML = addLeadingZero(newdate.getMinutes()) 
														 + ':' + addLeadingZero(newdate.getSeconds());
		}, 1000);
	};

	CheckIfWin(successCardsCount) {
		if (successCardsCount === cardsCount) {
			this.Stop(WinMsg);
		}
	};

	Stop(status) {
		clearInterval(this.timerId);
		this.ShowMessage(status);	
	};

	ShowMessage(status) {
		// Display message box
		let msg = document.getElementById('message');
		msg.style.display = "block";

		// Fill message text
		let msgStatus = document.getElementById('message__status');
		let messageLettersHtml = '';
		for (let i = 0; i < status.length; i++) {
			messageLettersHtml += '<div class="message__letter letter' + i + '">' + status[i] + '</div>';
		}
		msgStatus.innerHTML = messageLettersHtml;
		
		// Add animation to message text
		let letters = Array.from(document.getElementsByClassName('message__letter'));
		letters.forEach(function(letter, i, array) {
			let animationDelay = i;
			letter.style.animation = 'change-letter-size .5s ease-out .' + animationDelay + 's infinite normal';
		});

		// Fill button text
		let msgBtn = document.getElementById('message__btn');
		msgBtn.innerHTML = (status === WinMsg ? WinBtn : LoseBtn);
	};

	CloseMessage() {
		let msg = document.getElementById('message');
		msg.style.display = "none";
		this.RenewTimer();
		this.CloseCards();
	};

	RenewTimer() {
		document.getElementById('timer').innerHTML = '01:00';
	};

	CloseCards() {
		let cards = Array.from(document.getElementsByClassName('card'));
		cards.forEach(function(card) {
			card.classList.remove(opened);
			card.classList.remove(success);
			card.classList.remove(failure);
		});	
	};
};

/* ----------------------------------------------------------------------- */

class Card {
	constructor(cardFace) {
		this.currentCard = cardFace.parentNode;
	};

	__getOpenedCards() {
		let openedCards = Array.from(document.getElementsByClassName(opened));
		openedCards = openedCards.filter(function(openedCard) {
			return !openedCard.classList.contains(success);
		}, this);
		return openedCards;
	};

	__openSecondCard(previousOpenedCard) {
		function getEmojiName(card) {
			let emojiName = undefined;	
			card.childNodes.forEach(function(childNode) {
				if (childNode.tagName !== 'DIV') return;
				childNode.classList.forEach(function(className) {
					if (className.startsWith('emoji')) {
						emojiName = className;
					}
				});
			});
			return emojiName;
		}

		let emoji1 = getEmojiName(this.currentCard);
		let emoji2 = getEmojiName(previousOpenedCard);

		let resultClassName = emoji1 === emoji2 ? success : failure;
		this.currentCard.classList.add(resultClassName);
		previousOpenedCard.classList.add(resultClassName);
	};

	__openThirdCard(openedCards) {
		openedCards.forEach(function(elem) {
			if (!elem.classList.contains(success)) {
				elem.classList.remove(opened);
			}
		});

		let failureCards = Array.from(document.getElementsByClassName(failure));
		failureCards.forEach(function(elem) {
			elem.classList.remove(failure);
		});	
	};

	processClick() {
		if (this.currentCard.classList.contains(opened)) return;

		let openedCards = this.__getOpenedCards(); /* only active opened cards, without green (success) cards */

		switch (openedCards.length) {
			case 0:
				/* nothing to do*/;
				break;
			case 1:
				this.__openSecondCard(openedCards[0]);
				break;
			case 2:
				this.__openThirdCard(openedCards);
				break;
			default:
				throw 'too many opened cards';
		}
		this.currentCard.classList.toggle(opened);

		return document.getElementsByClassName(success).length;
	};
};


/* ----------------------------------------------------------------------- */
(function () { 
	let game = new Game();

	/* ----------------------------------------------------------------------- */
	let cardsElem = document.getElementById('game');
	cardsElem.addEventListener('click', function(event) {
		event.preventDefault();
		if (event.target.classList.contains('card__face')) {
			if (game.IsBeforeStart()) {
				game.Start(game);
			}
			let card = new Card(event.target);
			let successCardsCount = card.processClick();
			game.CheckIfWin(successCardsCount);
		}

		if (event.target.classList.contains('message__btn')) {
			game.CloseMessage();
		}
	});
}());