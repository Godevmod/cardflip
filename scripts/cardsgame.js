(async function () {
    const cardsList = [
        {
            cardType: 0,
            cardName: "King of hearts",
            image: "./images/card2.png"
        },
        {
            cardType: 0,
            cardName: "Queen of diamonds",
            image: "./images/card3.png"
        },
        {
            cardType: 1,
            cardName: "Joker",
            image: "./images/card1.png"
        }
    ];

    let canClickCards = true;
    let cardsOrder = [];
    let totalGames = localStorage.getItem("totalGames") ?? 0;
    let totalWins = localStorage.getItem("totalWins") ?? 0;
    let luckRate = localStorage.getItem("luckRate") ?? 0;

    let cardsBar = document.querySelector(".cards-container");
    let restartGame = document.querySelector(".restart");
    let totalGamesSpan = document.querySelector(".total-games");
    let totalWinsSpan = document.querySelector(".wins-rate");
    let luckRateSpan = document.querySelector(".luck-rate");
    let messageContainer = document.querySelector(".message-container");
    let messageBox = document.querySelector(".message-box");

    totalGamesSpan.addEventListener("click", function () {
        totalGames = 0;
        totalWins = 0;
        luckRate = 0;
        localStorage.setItem("luckRate", 0);
        localStorage.setItem("totalWins", 0);
        localStorage.setItem("totalGames", 0);
        totalGamesSpan.innerHTML = totalGames;
        totalWinsSpan.innerHTML = totalWins;
        luckRateSpan.innerHTML = luckRate + "%";
    });

    totalGamesSpan.innerHTML = totalGames;
    totalWinsSpan.innerHTML = totalWins;
    luckRateSpan.innerHTML = luckRate + "%";

    generateCards(cardsBar);

    function loadImage(imagePath) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                resolve(img);
            };
            img.onerror = (error) => {
                const cardFrontImg = document.createElement("img");
                reject(cardFrontImg);
            };
            img.src = imagePath;
        });
    }

    async function generateOneCard(cardParameters) {
        const cardDiv = document.createElement("div");
        cardDiv.classList.add("card");

        const cardInnerDiv = document.createElement("div");
        cardInnerDiv.classList.add("card-inner");

        const cardFrontDiv = document.createElement("div");
        cardFrontDiv.classList.add("card-front");

        const cardBackDiv = document.createElement("div");
        cardBackDiv.classList.add("card-back");

        const cardBackImg = await loadImage("./images/cardback.png");
        cardFrontDiv.appendChild(cardBackImg);
        cardInnerDiv.appendChild(cardFrontDiv);

        const cardFrontImg = await loadImage(cardParameters.image);
        cardFrontImg.alt = cardParameters.cardName;
        cardFrontImg.id = cardParameters.cardType;
        cardInnerDiv.appendChild(cardBackDiv);

        cardDiv.appendChild(cardInnerDiv);
        return {image: cardFrontImg, cardDiv, cardBackDiv, appender: cardInnerDiv};
    }

    function shuffleCardsArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function generateCards(cardsBar) {
        const promises = [];
        if (cardsOrder.length > 0) {
            for (let cardDetails of cardsOrder) {
                cardDetails.cardDiv.removeEventListener("click", cardDetails.clickHandler);
            }

            while (cardsBar.firstChild) {
                cardsBar.removeChild(cardsBar.firstChild);
            }
        }

        shuffleCardsArray(cardsList);

        for (let cardData of cardsList) {
            const cardPromise = generateOneCard(cardData).then(function (cardDetails) {
                cardsBar.appendChild(cardDetails.cardDiv);

                cardDetails.clickHandler = function (e) {
                    if (!canClickCards) {
                        return;
                    }
                    cardDetails.cardBackDiv.appendChild(cardDetails.image);
                    cardDetails.appender.style.transform = "rotateY(180deg)";
                    checkWinningState(cardData);
                };

                cardDetails.cardDiv.addEventListener("click", cardDetails.clickHandler);
                cardsOrder.push(cardDetails);
            });
            promises.push(cardPromise);
        }
        return Promise.all(promises).then(() => {
            return cardsOrder;
        });
    }

    function checkWinningState(cardData) {
        ++totalGames;
        localStorage.setItem("totalGames", totalGames.toString());
        totalGamesSpan.innerHTML = totalGames;
        canClickCards = false;

        const timeOut = setTimeout(function () {
            messageBox.style.display = "flex";
            clearTimeout(timeOut);
        }, 800);

        if (!cardData.cardType) {
            messageContainer.innerHTML = "You didn't find the right card";
        } else {
            messageContainer.innerHTML = "You win! The right card was selected!";
            ++totalWins;
            totalWinsSpan.innerHTML = totalWins;
            localStorage.setItem("totalWins", totalWins.toString());
        }

        let luckRate = (totalWins / totalGames * 100).toFixed(2);
        localStorage.setItem("luckRate", luckRate);
        luckRateSpan.innerHTML = luckRate + "%";
    }

    restartGame.addEventListener("click", function () {
        canClickCards = true;
        messageBox.style.display = "none";
        generateCards(cardsBar);
    });
})();
