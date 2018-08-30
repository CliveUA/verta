(function () {

    'use strict';

    // App configuration
    const app = {
        converterApiUrl: 'https://free.currencyconverterapi.com/api/v6',
        // countryApiUrl: 'https://restcountries.eu/rest/v2',
        countryApiUrl: 'https://www.countryflags.io',
        fromAmount: document.querySelector('#fromAmount'),
        toAmount: document.querySelector('#toAmount'),
        fromCurrency: document.querySelector('#fromCurrency'),
        toCurrency: document.querySelector('#toCurrency'),
        fromFlag: document.querySelector('#fromFlag'),
        toFlag: document.querySelector('#toFlag'),
        exchangeRate: document.querySelector('#exchangeRate'),
        fromCurrencyName: document.querySelector('#fromCurrencyName'),
        toCurrencyName: document.querySelector('#toCurrencyName'),
        currencies: {},
        lastEditedInput: document.querySelector('#fromAmount')
    }

    // Initialize the application
    app.init = () => {
        // Fetch all currencies and add them to the ui.
        // Then perform a conversion on the default currencies
        app.fetchCurrencies().then(app.convertTo);
    }

    // Getters and setters for the @from and @to amounts in the ui
    app.getFromAmount = () => parseFloat(app.fromAmount.value);

    app.setFromAmount = (amount) => app.fromAmount.value = amount;

    app.getToAmount = () => parseFloat(app.toAmount.value);

    app.setToAmount = (amount) => app.toAmount.value = amount;

    app.setExchangeRate = (fromCurrencyName, toCurrencyName, rate) => {
        app.fromCurrencyName.innerHTML = fromCurrencyName;
        app.toCurrencyName.innerHTML = toCurrencyName;
        app.exchangeRate.innerHTML = rate;
    }

    app.setCountryFlag = (flag, code) => {
        flag.src = `${app.countryApiUrl}/${code}/flat/24.png`;
    }

    // Gets the rate from @from to @to
    app.fetchRate = (from, to) => {
        const convertEndpoint = `${app.converterApiUrl}/convert?q=${from}_${to}&compact=ultra`;

        return fetch(convertEndpoint)
            .then(function (response) {
                if (response.ok) {
                    return response.json();
                }

                throw new Error('API response was not ok.');
            })
            .then(function (rate) {
                return parseFloat(rate[Object.keys(rate)[0]]);
            }).catch(function (error) {
                throw new Error('There was a problem getting the currencies: ', error.message);
            });
    }

    // Converts the @fromCurrency to the @toCurrency
    app.convertTo = () => {
        app.fetchRate(app.fromCurrency.value, app.toCurrency.value)
            .then(rate => {
                const fromAmount = app.getFromAmount();
                const fromCurrencyName =
                    app.currencies[app.fromCurrency.value].currencyName
                const toCurrencyName =
                    app.currencies[app.toCurrency.value].currencyName

                app.setToAmount((fromAmount * rate).toFixed(2));
                app.setExchangeRate(fromCurrencyName, toCurrencyName, rate.toFixed(2));
            });
    }

    // Converts the @toCurrency to the @fromCurrency
    app.convertFrom = () => {
        app.fetchRate(app.toCurrency.value, app.fromCurrency.value)
            .then(rate => {
                const toAmount = app.getToAmount();
                app.setFromAmount((toAmount * rate).toFixed(2));
            });
    }


    // Prefills the UI with available currencies
    app.addCurrencies = () => {
        // if we have currencies
        if (Object.keys(app.currencies).length > 0) {
            // sort the currencies
            const sortedCurrencies = Object.keys(app.currencies).sort(function(a, b) {
                if (a < b) { return -1 };
                if (a > b) { return 1 };

                return 0;
            });

            // add them to the 'from' and 'to' currency dropdowns
            for (const currency of sortedCurrencies) {
                app.fromCurrency.options[app.fromCurrency.options.length] =
                    new Option(currency, currency);

                app.toCurrency.options[app.toCurrency.options.length] =
                    new Option(currency, currency);
            }
        }
    }

    // Fetches all available currencies, stores them in
    // app.currencies and adds them to the UI.
    app.fetchCurrencies = () => {
        // if we have the currencies cached already
        if (window.localStorage.getItem('currencies') !== null) {
            return new Promise(function(resolve, reject) {
                // fetch the currencies from the local storage
                app.currencies = JSON.parse(window.localStorage.getItem('currencies'));

                // update the ui
                app.addCurrencies();

                resolve();
            });
        } else {
            // if not, fetch it from the API
            const currenciesEndpoint = `${app.converterApiUrl}/currencies`;

            return fetch(currenciesEndpoint)
                .then(function (response) {
                    if (response.ok) {
                        return response.json();
                    }

                    throw new Error('API response was not ok.');
                })
                .then(function (currencies) {
                    app.currencies = currencies.results;
                    app.addCurrencies(); // update the ui

                    // Caches the list of currencies in local storage
                    window.localStorage.setItem('currencies', JSON.stringify(currencies.results));
                }).catch(function (error) {
                    throw new Error('There was a problem getting the currencies: ', error.message);
                });
        }
    }

    // Converts the last edited input amount
    app.convertLastEditedInput = () => {
        if (app.lastEditedInput === app.fromAmount) {
            app.convertTo();
        } else if (app.lastEditedInput === app.toAmount) {
            app.convertFrom();
        }
    }

    /*****************************************************************************
     *
     * Event listeners for UI elements
     *
     ****************************************************************************/
    // converts fromCurrency to toCurrency when fromCurrency changes
    app.fromCurrency.addEventListener('change', () => {
        app.convertLastEditedInput();
        app.setCountryFlag(app.fromFlag, app.fromCurrency.value.substring(0, 2));
    });

    app.toCurrency.addEventListener('change', () => {
        app.convertLastEditedInput();
        app.setCountryFlag(app.toFlag, app.toCurrency.value.substring(0, 2));
    });

    app.fromAmount.addEventListener('keyup', () => {
        if (app.lastEditedInput !== app.fromAmount) {
            app.lastEditedInput = app.fromAmount;
        }

        app.convertTo();
    });

    app.toAmount.addEventListener('keyup', () => {
        if (app.lastEditedInput !== app.toAmount) {
            app.lastEditedInput = app.toAmount;
        }

        app.convertFrom();
    });

    app.init();
})();