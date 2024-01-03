try {
    function eCalendar() {
        this.conf = null;
        this.isKindle = false;
        this.isMac = false;
        this.rotate = 0;
        this.tzoffset = 0;
        this.country = null;
        this.lang = null;
        this.fontFamily = null;
        this.fontLoadChecked = false;
        this.fontLoadCheckCount = 0;
        this.fontLoadCheckMax = 2;
        this.init = true;
        this.timerID = null;
        this.datetime = null;
        this.tmpDate = null;
        this.initDatetime = null;
        this.elapsedSec = null;
        this.drawECal = function () {
            this.datetime = new Date();
            if (this.tzoffset !== 0) {
                var osTzOffset = new Date().getTimezoneOffset();
                this.datetime.setTime(this.datetime.getTime() + (osTzOffset * 60 + this.tzoffset) * 1000);
            }
            var T = this.datetime.getTime();
            var D = this.datetime.getDate();
            var H = this.datetime.getHours();
            var M = this.datetime.getMinutes();
            var S = this.datetime.getSeconds();
            const countdownDate = this.toDateObject(this.conf["countdown"]);
            var today = new Date(new Date().setHours(0, 0, 0, 0));
            if (countdownDate < today) {
                delete this.conf["countdown"];
            }
            if (this.init) {
                this.calcItemSize();
                this.createBaseElements();
                this.initDatetime = this.datetime;
            }
            this.elapsedSec = Math.floor((T - this.initDatetime.getTime()) / 1000);
            if (H == 4 && M == 0 && S == 0) {
                var ecal = this;
                $.ajax({
                    type: "GET",
                    url: "http://ecal.ink/api/refresh_checker/?" + T,
                    success: function (msg) {
                        ecal.reload(true);
                    }
                });
            }
            if (this.tmpDate === null || this.tmpDate != D) {
                for (var func in this.initAndDailyFuncs) {
                    var opt = this.initAndDailyFuncs[func];
                    this[func](opt);
                }
                this.tmpDate = D;
            }
            this.drawClockHands();
            if (S == 0) {
                var forceUpdate = (M == 0) ? true : false;
                this.drawClockSchedule(forceUpdate);
            }
            if (M % 10 == 0 && S == 0) {
                this.drawRandomSpace();
            }
            this.init = false;
            var _clock = this;
            this.timerID = setTimeout(function () {
                _clock.drawECal();
            }, 60000 - Date.now() % 60000);
        }
        this.start = function (country, tzoffset, conf, kindle) {
            this.country = country;
            this.tzoffset = tzoffset;
            this.conf = conf;
            this.isKindle = kindle == 1;
            this.isMac = /iPad|iPhone|Macintosh/.test(navigator.userAgent)
            if (this.isKindle) {
                this.rotate = this.conf["rotate"];
            }
            if (this.isMac) {
                this.fontFamily = "HelveticaNeue-CondensedBold";
            } else {
                this.fontFamily = "Roboto Condensed";
            }
            if (conf["lang"] != "" && conf["lang"] !== null) {
                this.lang = conf["lang"];
            } else {
                this.lang = "en";
            }
            this.drawECal();
        }
    }
    eCalendar.prototype.initAndDailyFuncs = {
        "drawClockSchedule": "true",
        "drawClockFrame": null,
        "drawDatearea": null,
        "drawCalendar": null,
        "drawMiniCalendar": null,
        "drawRandomSpace": null,
    };
    eCalendar.prototype.fontReloadFuncs = {
        "drawDatearea": null,
        "drawCalendar": null,
        "drawMiniCalendar": null,
    };
    eCalendar.prototype.yokoFlg = false;
    eCalendar.prototype.landscape = false;
    eCalendar.prototype.portrait = false;
    eCalendar.prototype.docWidth = null;
    eCalendar.prototype.docHeight = null;
    eCalendar.prototype.docWidthDiff = 0;
    eCalendar.prototype.docHeightDiff = 0;
    eCalendar.prototype.clockSize = null;
    eCalendar.prototype.calcItemSize = function () {
        var width = window.innerWidth;
        var iHeight = window.innerHeight;
        var oHeight = window.outerHeight;
        if (this.isKindle != 1) {
            this.docWidth = width;
            this.docHeight = iHeight;
            this.rotate = 0;
            if (iHeight < width) {
                this.landscape = true;
            } else if (iHeight / width >= 16 / 11) {
                this.portrait = true;
            }
        } else if (this.isKindle == 1 && iHeight > oHeight) {
            this.docWidth = width * 1.1;
            this.docHeight = oHeight * 1.09;
            this.docWidthDiff = width - this.docWidth;
            this.docHeightDiff = oHeight - this.docHeight;
        } else {
            this.docWidth = width;
            this.docHeight = iHeight;
        }
        this.yokoFlg = (this.rotate == 90 || this.rotate == 270) ? true : false;
        if (this.yokoFlg) {
            this.clockSize = Math.floor(this.docHeight * 2 / 5);
        } else if (this.landscape) {
            this.clockSize = Math.floor(this.docWidth * 2 / 5);
        } else {
            this.clockSize = Math.floor(this.docWidth * 3 / 5);
        }
        this.clockRadSize = this.landscape ? (this.clockSize * 6 / 10) / 2 : (this.clockSize * 9 / 10) / 2;
        if (this.yokoFlg) {
            this.dateareaWidth = this.docWidth;
            this.dateareaHeight = this.clockSize * 3 / 2;
        } else if (this.landscape) {
            this.dateareaWidth = this.clockSize;
            this.dateareaHeight = this.docHeight;
        } else {
            this.dateareaWidth = this.docWidth;
            this.dateareaHeight = Math.floor(this.clockSize / 2);
        }
        if (this.yokoFlg || this.landscape) {
            this.dateFontSizeY = Math.floor(this.clockSize * 4 / 40);
            this.dateFontSizeR = Math.floor(this.clockSize * 2 / 40);
            this.dateFontSizeM = Math.floor(this.clockSize * 8 / 40);
            this.dateFontSizeD = Math.floor(this.clockSize * 16 / 40);
            this.dateFontSizeW = (this.dateFontSizeD - this.dateFontSizeM) * 4 / 8;
            this.dateFontSizeT = Math.floor(this.clockSize * 1 / 40);
        } else {
            this.dateFontSizeY = Math.floor(this.clockSize * 3 / 40);
            this.dateFontSizeR = Math.floor(this.clockSize * 3 / 80);
            this.dateFontSizeM = Math.floor(this.clockSize * 6 / 40);
            this.dateFontSizeD = Math.floor(this.clockSize * 12 / 40);
            this.dateFontSizeW = (this.dateFontSizeD - this.dateFontSizeM) * 4 / 8;
            this.dateFontSizeT = Math.floor(this.clockSize * 1 / 40);
        }
        this.dateFontSizeS = this.dateFontSizeM * 3 / 4;
        this.activeDateareaH = this.dateFontSizeD;
        if (this.yokoFlg) {
            this.calendarWidth = this.docWidth * 3 / 4;
            this.calendarHeight = this.docHeight - this.clockSize;
        } else if (this.landscape) {
            this.calendarWidth = this.docWidth - this.clockSize;
            this.calendarHeight = this.docHeight * 3 / 4;
        } else if (this.portrait) {
            this.calendarWidth = this.docWidth;
            this.calendarHeight = (this.docHeight - this.clockSize) * 5 / 8;
        } else {
            this.calendarWidth = this.docWidth;
            this.calendarHeight = this.docHeight - this.clockSize;
        }
        if (this.rotate == 90) {
            this.clockTop = 0;
            this.clockLeft = (this.docWidth - this.activeDateareaH - this.clockSize);
        } else if (this.rotate == 180) {
            this.clockTop = this.calendarHeight;
            this.clockLeft = 0;
        } else if (this.rotate == 270) {
            this.clockTop = this.calendarHeight;
            this.clockLeft = this.activeDateareaH;
        } else if (this.landscape) {
            this.clockTop = this.activeDateareaH;
            this.clockLeft = 0;
        } else {
            this.clockTop = 0;
            this.clockLeft = this.docWidth - this.clockSize;
        }
        var clockYajst = clockXajst = 0;
        if (this.landscape) {
            clockYajst = -((this.clockSize - this.clockRadSize * 2) / 2) * 3 / 5;
        } else if (this.rotate == 90) {
            clockXajst = 0.1;
        } else if (this.rotate == 270) {
            clockXajst = -0.1;
        } else if (this.rotate == 180) {
            clockYajst = 0.1;
        } else if (this.rotate == 0) {
            clockYajst = -0.1;
        }
        this.clockCenterX = this.clockSize / 2 + clockXajst;
        this.clockCenterY = this.clockSize / 2 + clockYajst;
        if (this.landscape) {
            this.activeClockH = this.clockRadSize * 2 + clockYajst;
        } else {
            this.activeClockH = this.clockSize;
        }
    }
    eCalendar.prototype.weeksShort = ["S", "M", "T", "W", "T", "F", "S"];
    eCalendar.prototype.weeks = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    eCalendar.prototype.weeksFull = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    eCalendar.prototype.weeksJa = ['日', '月', '火', '水', '木', '金', '土'];
    eCalendar.prototype.weeksJaFull = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
    eCalendar.prototype.holidays = {
        "ja": {
            1: {
                1: "元日",
                2: "休日",
                9: "成人の日"
            },
            2: {
                11: "建国記念の日",
                23: "天皇誕生日"
            },
            3: {
                21: "春分の日"
            },
            4: {
                29: "昭和の日"
            },
            5: {
                3: "憲法記念日",
                4: "みどりの日",
                5: "こどもの日"
            },
            7: {
                17: "海の日"
            },
            8: {
                11: "山の日"
            },
            9: {
                18: "敬老の日",
                23: "秋分の日"
            },
            10: {
                9: "スポーツの日"
            },
            11: {
                3: "文化の日",
                23: "勤労感謝の日"
            }
        },
        "us": {
            1: {
                1: "New Year's Day",
                17: "Birthday of Martin Luther King, Jr."
            },
            2: {
                21: "Washington's Birthday (President's Day)"
            },
            5: {
                30: "Memorial Day"
            },
            6: {
                19: "Juneteenth National Independence Day",
                20: "Substitution (Juneteenth National Independence Day)"
            },
            7: {
                4: "Independence Day"
            },
            9: {
                5: "Labor Day"
            },
            10: {
                10: "Columbus Day"
            },
            11: {
                11: "Veterans Day",
                24: "Thanksgiving Day"
            },
            12: {
                25: "Christmas Day",
                26: "Substitution (Christmas Day)"
            }
        }
    };
    eCalendar.prototype.holidayCheck = function (i, m, d) {
        if (i == 0 || i == 6) {
            return true;
        }
        if (this.country == '-') {
            return false;
        }
        if (this.holidays[this.country] && this.holidays[this.country][m] && this.holidays[this.country][m][d]) {
            return true;
        }
        return false;
    }
    eCalendar.prototype.reload = function (refresh) {
        if (refresh && this.isKindle) {
            location.href = '/k/blackrefresh/';
        } else {
            location.reload();
        }
    }
    eCalendar.prototype.removeAllChildren = function (elm) {
        while (elm.firstChild) {
            elm.removeChild(elm.firstChild);
        }
    }
    eCalendar.prototype.toDoubleDigits = function (num) {
        num += "";
        if (num.length === 1) {
            num = "0" + num;
        }
        return num;
    }
    eCalendar.prototype.toDateObject = function (dt) {
        if (typeof (dt) == "string") {
            var regexp = /(\d+)[\-\/]?(\d+)[\-\/]?(\d+)/;
            var matchs = dt.match(regexp);
            if (matchs) {
                var y = matchs[1];
                var m = parseInt(matchs[2]) - 1;
                var d = parseInt(matchs[3]);
                return new Date(y, m, d);
            }
        } else if (Object.prototype.toString.call(dt).slice(8, -1) == 'Date') {
            return dt;
        }
        return new Date();
    }
    eCalendar.prototype.formatYMDSlash = function (dt) {
        var y = m = d = 0;
        if (typeof (dt) == "string") {
            var regexp = /(\d+)[\-\/]?(\d+)[\-\/]?(\d+)/;
            var matchs = dt.match(regexp);
            if (matchs) {
                y = matchs[1];
                m = ('00' + matchs[2]).slice(-2);
                d = ('00' + matchs[3]).slice(-2);
                return (y + '/' + m + '/' + d);
            }
        } else if (Object.prototype.toString.call(dt).slice(8, -1) == 'Date') {
            y = dt.getFullYear();
            m = ('00' + (dt.getMonth() + 1)).slice(-2);
            d = ('00' + dt.getDate()).slice(-2);
            return (y + '/' + m + '/' + d);
        }
    }
    eCalendar.prototype.formatYMD = function (dt) {
        var y = dt.getFullYear();
        var m = ('00' + (dt.getMonth() + 1)).slice(-2);
        var d = ('00' + dt.getDate()).slice(-2);
        return (y + '' + m + '' + d);
    }
    eCalendar.prototype.drawStar = function (ctx, cx, cy, radius) {
        ctx.save();
        ctx.beginPath();
        var points = 5;
        var oneAngle = 360 / points;
        for (var i = 0; i < points; i++) {
            var angle = -90 + (oneAngle * i);
            var radians = angle * (Math.PI / 180);
            var harfRad = (angle + (oneAngle / 2)) * (Math.PI / 180);
            var base = radius * Math.cos(radians);
            var height = radius * Math.sin(radians);
            x = cx + base;
            y = cy + height;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            base = (radius * 3 / 8) * Math.cos(harfRad);
            height = (radius * 3 / 8) * Math.sin(harfRad);
            x = cx + base;
            y = cy + height;
            ctx.lineTo(x, y);
        }
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }
    eCalendar.prototype.hsc = function (str) {
        return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    }
    eCalendar.prototype.createBaseElements = function () {
        if (!this.init) {
            return;
        }
        const divs = {
            "configBtnDiv": 100000,
            "foreground": 50000,
            "background": 100
        };
        Object.keys(divs).forEach(function (name) {
            var idx = divs[name];
            var div = document.createElement("div");
            div.id = name;
            div.style.position = "absolute";
            div.style.zIndex = idx;
            document.body.appendChild(div);
        });
        this.drawConfigBtn();
    }
    eCalendar.prototype.drawFontDebug = function () {
        var cvs = document.createElement("canvas");
        cvs.id = "fontLoadChecker";
        cvs.style.zIndex = 200000000;
        cvs.style.position = "absolute";
        document.body.appendChild(cvs);
        const fontdebug = document.getElementById('fontLoadChecker');
        const ctx = fontdebug.getContext('2d');
        const txt = "WIP";
        ctx.font = "40px " + this.fontFamily;
        const textW = Math.floor(ctx.measureText(txt).width);
        ctx.fillText(textW, 200, 50);
    }
    eCalendar.prototype.isFontLoaded = function () {
        var cvs = document.createElement("canvas");
        cvs.id = "fontLoadChecker";
        document.body.appendChild(cvs);
        const fontdebug = document.getElementById('fontLoadChecker');
        const ctx = fontdebug.getContext('2d');
        const txt = "WIP";
        ctx.font = "40px " + this.fontFamily;
        const textW = Math.floor(ctx.measureText(txt).width);
        return textW === 61;
    }
    eCalendar.prototype.drawConfigBtn = function () {
        this.configBtnSize = this.docWidth / 15;
        if (this.rotate == 90) {
            this.configBtnTop = this.configBtnSize / 2;
            this.configBtnLeft = this.configBtnSize / 2;
        } else if (this.rotate == 180) {
            this.configBtnTop = (this.docHeight - this.configBtnSize * 3 / 2);
            this.configBtnLeft = this.configBtnSize / 2;
        } else if (this.rotate == 270) {
            this.configBtnTop = (this.docHeight - this.configBtnSize * 3 / 2);
            this.configBtnRight = this.configBtnSize / 2 + this.docWidthDiff;
        } else if (this.landscape) {
            this.configBtnSize /= 2;
            this.configBtnBottom = this.configBtnSize / 2;
            this.configBtnLeft = this.configBtnSize / 2;
        } else {
            this.configBtnTop = this.configBtnSize / 2;
            this.configBtnRight = this.configBtnSize / 2 + this.docWidthDiff;
        }
        var cfg = document.getElementById('configBtnDiv');
        var anc = document.createElement("a");
        anc.style.color = "#000";
        if (this.isKindle) {
            var img = document.createElement("img");
            img.id = "configBtn";
            img.src = "/img/gear-solid.svg";
            anc.href = "/config-kindle/";
            anc.appendChild(img);
        } else {
            var icon = document.createElement("i");
            icon.id = "configBtn";
            icon.style.fontSize = this.configBtnSize + "px";
            icon.classList.add('fa');
            icon.classList.add('fa-cog');
            icon.ariaHidden = "true";
            anc.href = "/config/";
            anc.appendChild(icon);
        }
        cfg.appendChild(anc);
        const cfgDiv = document.getElementById('configBtnDiv');
        const cfgBtn = document.getElementById('configBtn');
        cfgDiv.style.width = this.configBtnSize + "px";
        cfgDiv.style.height = this.configBtnSize + "px";
        if (this.configBtnTop) {
            cfgDiv.style.top = this.configBtnTop + "px";
        } else {
            cfgDiv.style.bottom = this.configBtnBottom + "px";
        }
        if (this.configBtnLeft) {
            cfgDiv.style.left = this.configBtnLeft + "px";
        } else {
            cfgDiv.style.right = this.configBtnRight + "px";
        }
        cfgBtn.style.width = this.configBtnSize + "px";
        cfgBtn.style.height = this.configBtnSize + "px";
    }
    eCalendar.prototype.drawCalendar = function () {
        const countdownYMD = this.conf["countdown"] ? this.formatYMDSlash(this.conf["countdown"]) : null;
        var calendarW = this.calendarWidth;
        var calendarH = this.calendarHeight;
        if (this.yokoFlg) {
            calendarW = this.calendarHeight;
            calendarH = this.calendarWidth;
        }
        if (this.init) {
            this.calendarZIndex = 1000;
            if (this.rotate == 90) {
                this.calendarTop = this.clockSize;
                this.calendarLeft = this.docWidth - this.calendarWidth;
            } else if (this.rotate == 180) {
                this.calendarTop = 0;
                this.calendarLeft = 0;
            } else if (this.rotate == 270) {
                this.calendarTop = 0;
                this.calendarLeft = 0;
            } else if (this.landscape) {
                this.calendarTop = 0;
                this.calendarLeft = this.clockSize;
            } else {
                this.calendarTop = this.clockSize;
                this.calendarLeft = 0;
            }
            this.calFontSizeT = this.yokoFlg ? Math.floor(this.calendarHeight / 16) : Math.floor(this.calendarHeight / 12);
            this.calFontSizeD = Math.floor(this.calendarHeight / 14);
            var cvs = document.createElement("canvas");
            cvs.id = "calendar";
            cvs.style.zIndex = this.calendarZIndex;
            cvs.style.position = "absolute";
            document.body.appendChild(cvs);
            const calendar = document.getElementById('calendar');
            calendar.setAttribute("width", this.calendarWidth);
            calendar.setAttribute("height", this.calendarHeight);
            calendar.style.width = this.calendarWidth + "px";
            calendar.style.height = this.calendarHeight + "px";
            if (this.calendarTop) {
                calendar.style.top = this.calendarTop + "px";
            } else {
                calendar.style.bottom = this.calendarBottom + "px";
            }
            if (this.calendarLeft) {
                calendar.style.left = this.calendarLeft + "px";
            } else {
                calendar.style.Right = this.calendarRight + "px";
            }
            this.calendarCtx = calendar.getContext('2d');
            if (this.rotate == 90) {
                this.calendarCtx.translate(calendarH, 0);
            } else if (this.rotate == 180) {
                this.calendarCtx.translate(calendarW, calendarH);
            } else if (this.rotate == 270) {
                this.calendarCtx.translate(0, calendarW);
            }
            this.calendarCtx.rotate(Math.PI * this.rotate / 180);
        }
        var fontColorOtherM = '#999';
        var fontColorWeekday = '#000';
        var fontColorSaturday = this.isKindle ? '#000' : '#013b9c';
        var fontColorSunday = this.isKindle ? '#000' : '#e40313';
        var fontColorToday = '#fff';
        var fontColorHead = '#fff';
        var fontColorAchiveCnt = this.isKindle ? '#333' : '#aaa';
        var fontSizeToday = this.yokoFlg ? this.calFontSizeD * 1.5 : this.calFontSizeD * 1.8;
        var fontSizeThisM = this.yokoFlg ? this.calFontSizeD * 1.2 : this.calFontSizeD * 1.3;
        var fontSizeOtherM = this.yokoFlg ? this.calFontSizeD * 1.1 : this.calFontSizeD * 1.2;
        var fontSizeAchiveCnt = this.isKindle ? this.calFontSizeD * 0.6 : this.calFontSizeD * 0.4;
        var cellColorWeekday = '#fff';
        var cellColorHoliday = this.isKindle ? '#ccc' : '#fff';
        var cellColorToday = this.isKindle ? '#000' : '#11ce35';
        var cellColorCountDown = '#000';
        var cellColorHeadWkd = '#333';
        var cellColorHeadSat = this.isKindle ? '#000' : '#013b9c';
        var cellColorHeadSun = this.isKindle ? '#000' : '#e40313';
        var calBGColor = '#666';
        const WEEKS = (this.lang == "ja") ? this.weeksJa : this.weeks;
        const year = this.datetime.getFullYear();
        const month = this.datetime.getMonth() + 1;
        const today = this.datetime.getDate();
        const startWD = new Date(year, month - 1, 1).getDay();
        const startDate = new Date(year, month - 1, 1).getDate();
        const startYMD = year + '/' + month + '/' + startDate;
        const endDate = new Date(year, month, 0).getDate();
        const lastMonthEndDate = new Date(year, month - 1, 0).getDate();
        var lastMonth;
        var nextMonth;
        if (month == 11) {
            lastMonth = 10;
            nextMonth = 12;
        } else if (month == 12) {
            lastMonth = 11;
            nextMonth = new Date(year + 1, 0, 1).getMonth();
        } else {
            lastMonth = new Date(year, month - 1, 1).getMonth();
            nextMonth = new Date(year, month + 1, 1).getMonth();
        }
        const weekCnt = Math.ceil((endDate - 7 + startWD) / 7) + 1;
        const headCellHeight = this.calFontSizeT * 2;
        const calCellWidth = (calendarW - 3) / 7 - 1;
        const calCellHeight = (calendarH - (this.calFontSizeT * 2) - weekCnt) / weekCnt;
        const padding = 2;
        var posX = posY = 0;
        const ctx = this.calendarCtx;
        ctx.fillStyle = calBGColor;
        ctx.fillRect(posX, posY, calendarW, calendarH);
        posX = padding;
        posY = padding;
        for (var i = 0; i < this.weeks.length; i++) {
            if (i !== 0) {
                posX += (calCellWidth + 1);
            }
            if (i === 0) {
                ctx.fillStyle = cellColorHeadSun;
            } else if (i === 6) {
                ctx.fillStyle = cellColorHeadSat;
            } else {
                ctx.fillStyle = cellColorHeadWkd;
            }
            ctx.fillRect(posX, posY, calCellWidth, headCellHeight);
        }
        var posX = padding;
        var posY = this.calFontSizeT * 1.5;
        ctx.font = this.calFontSizeT + "px " + this.fontFamily;
        ctx.fillStyle = fontColorHead;
        ctx.textBaseline = "alphabetic";
        for (var i = 0; i < WEEKS.length; i++) {
            T = WEEKS[i];
            if (i !== 0) {
                posX += (calCellWidth + 1);
            }
            textWidth = ctx.measureText(T).width;
            ctx.fillText(T, posX + (calCellWidth - textWidth) / 2, posY);
        }
        var posCellX = 0;
        var posCellY = this.calFontSizeT * 2 + 4;
        var d = 1;
        ctx.fillStyle = cellColorWeekday;
        for (var w = 0; w < weekCnt; w++) {
            posCellX = padding;
            if (w !== 0) {
                posCellY += calCellHeight + 1;
            }
            for (var i = 0; i < this.weeks.length; i++) {
                if (i !== 0) {
                    posCellX += (calCellWidth + 1);
                }
                ctx.fillRect(posCellX, posCellY, calCellWidth, calCellHeight);
                if (w == 0 && i < startWD) { } else if (d > endDate) {
                    var nextMonthD = d - endDate;
                    var ymd = this.formatYMDSlash(year + "/" + nextMonth + "/" + nextMonthD);
                    if (countdownYMD && ymd == countdownYMD) {
                        ctx.fillStyle = fontColorOtherM;
                        var cx = posCellX + calCellWidth / 2;
                        var cy = this.yokoFlg || this.landscape ? posCellY + calCellHeight * 3 / 4 : posCellY + calCellHeight * 5 / 6;
                        var rad = calCellHeight / 6;
                        this.drawStar(ctx, cx, cy, rad);
                    }
                    d++;
                } else {
                    if (d == today) {
                        if (!this.isKindle && i == 6) {
                            ctx.fillStyle = fontColorSaturday;
                        } else if (!this.isKindle && i == 0) {
                            ctx.fillStyle = fontColorSunday;
                        } else {
                            ctx.fillStyle = cellColorToday;
                        }
                        ctx.fillRect(posCellX, posCellY, calCellWidth, calCellHeight);
                    } else if (this.isKindle && this.holidayCheck(i, month, d)) {
                        ctx.fillStyle = cellColorHoliday;
                        ctx.fillRect(posCellX, posCellY, calCellWidth, calCellHeight);
                    }
                    var ymd = this.formatYMDSlash(year + "/" + month + "/" + d);
                    if (countdownYMD && ymd == countdownYMD) {
                        if (d == today) {
                            ctx.fillStyle = fontColorToday;
                        } else if (!this.isKindle && i === 6) {
                            ctx.fillStyle = fontColorSaturday;
                        } else if (!this.isKindle && this.holidayCheck(i, month, d)) {
                            ctx.fillStyle = fontColorSunday;
                        } else {
                            ctx.fillStyle = fontColorWeekday;
                        }
                        var cx = posCellX + calCellWidth / 2;
                        var cy = this.yokoFlg || this.landscape ? posCellY + calCellHeight * 3 / 4 : posCellY + calCellHeight * 5 / 6;
                        var rad = calCellHeight / 6;
                        this.drawStar(ctx, cx, cy, rad);
                    }
                    ctx.fillStyle = cellColorWeekday;
                    d++;
                }
            }
        }
        var ajstY = 0;
        posY = headCellHeight + calCellHeight / 10;
        d = dtxt = 1;
        ctx.font = this.calFontSizeD + "px " + this.fontFamily;
        ctx.textBaseline = "top";
        for (var w = 0; w < weekCnt; w++) {
            posX = padding;
            if (w !== 0) {
                posY += calCellHeight + 1;
            }
            for (var i = 0; i < this.weeks.length; i++) {
                if (i !== 0) {
                    posX += calCellWidth + 1;
                }
                ajstX = padding;
                ajstY = 0;
                if (w == 0 && i < startWD) {
                    ctx.fillStyle = fontColorOtherM;
                    dtxt = lastMonthEndDate - startWD + i + 1
                    ctx.font = fontSizeOtherM + "px " + this.fontFamily;
                    textWidth = ctx.measureText(dtxt).width;
                    ajstX = (calCellWidth - textWidth) / 2;
                } else if (d > endDate) {
                    ctx.fillStyle = fontColorOtherM;
                    dtxt = d - endDate
                    if (dtxt == 1) {
                        dtxt = nextMonth + "/" + dtxt;
                        ctx.font = this.yokoFlg ? fontSizeOtherM * 4 / 5 + "px " + this.fontFamily : fontSizeOtherM + "px " + this.fontFamily;
                    } else {
                        ctx.font = fontSizeOtherM + "px " + this.fontFamily;
                    }
                    textWidth = ctx.measureText(dtxt).width;
                    ajstX = (calCellWidth - textWidth) / 2;
                    d++;
                } else {
                    if (d == today) {
                        ctx.font = fontSizeToday + "px " + this.fontFamily;
                    } else {
                        ctx.font = fontSizeThisM + "px " + this.fontFamily;
                    }
                    if (d == today) {
                        ctx.fillStyle = fontColorToday;
                    } else if (!this.isKindle && i === 6) {
                        ctx.fillStyle = fontColorSaturday;
                    } else if (!this.isKindle && this.holidayCheck(i, month, d)) {
                        ctx.fillStyle = fontColorSunday;
                    } else {
                        ctx.fillStyle = fontColorWeekday;
                    }
                    dtxt = d;
                    if (d == 1) {
                        dtxt = month + "/" + dtxt;
                        ctx.font = this.yokoFlg ? fontSizeThisM * 4 / 5 + "px " + this.fontFamily : fontSizeThisM + "px " + this.fontFamily;
                    }
                    textWidth = ctx.measureText(dtxt).width;
                    ajstX = (calCellWidth - textWidth) / 2;
                    var ymd = this.formatYMDSlash(year + "/" + month + "/" + d);
                    if (this.isKindle && !this.yokoFlg && countdownYMD && ymd == countdownYMD) {
                        ajstY -= calCellHeight / 10;
                    }
                    d++;
                }
                if (this.isMac) {
                    ajstY += ctx.measureText(i).actualBoundingBoxAscent;
                }
                ctx.fillText(dtxt, posX + ajstX, posY + ajstY);
            }
        }
        var ecal = this;
        var d = new Date();
        $.ajax({
            type: "GET",
            dataType: "json",
            url: "http://ecal.ink/api/fitness-get/?" + d.getTime(),
            success: function (achives) {
                if (!achives || (ecal.preAchives && ecal.preAchives == achives)) {
                    return;
                }
                ecal.preAchives = achives;
                var initD = new Date(startYMD);
                initD.setDate(initD.getDate() - startWD);
                var initYMDSlash = ecal.formatYMDSlash(initD);
                var initYMD = ecal.formatYMD(initD);
                var initYMDIndex = achives.indexOf(parseInt(initYMD));
                var cnt = 0;
                var checkmark = '✓';
                if (initYMDIndex != -1) {
                    var dt = new Date(initYMDSlash);
                    for (var i = 1; i < achives.length; i++) {
                        dt.setDate(dt.getDate() - 1);
                        var ymd = ecal.formatYMD(dt);
                        if (achives.indexOf(parseInt(ymd)) != -1) {
                            cnt++;
                        } else {
                            break;
                        }
                    }
                }
                achiveR = calCellWidth / 10;
                posCellX = 0;
                posCellY = headCellHeight + 4;
                d = 1;
                ctx.textBaseline = "middle";
                for (var w = 0; w < weekCnt; w++) {
                    posCellX = padding;
                    if (w !== 0) {
                        posCellY += calCellHeight + 1;
                    }
                    for (var i = 0; i < ecal.weeks.length; i++) {
                        if (i !== 0) {
                            posCellX += (calCellWidth + 1);
                        }
                        var m;
                        if (w == 0 && i < startWD) {
                            dtxt = lastMonthEndDate - startWD + i + 1;
                            mtxt = lastMonth;
                        } else if (d > endDate) {
                            dtxt = d - endDate;
                            mtxt = nextMonth;
                            d++;
                        } else {
                            dtxt = d;
                            mtxt = month;
                            d++;
                        }
                        var ymd = year + ecal.toDoubleDigits(mtxt) + ecal.toDoubleDigits(dtxt);
                        if (achives.indexOf(parseInt(ymd)) != -1) {
                            cnt++;
                            ctx.font = fontSizeAchiveCnt + "px " + this.fontFamily;
                            ctx.fillStyle = fontColorAchiveCnt;
                            ctx.textBaseline = "bottom";
                            var continuousWeek = Math.ceil(cnt / 7);
                            var achiveText = '';
                            for (j = 1; j <= continuousWeek; j++) {
                                achiveText = achiveText + checkmark;
                                if (j >= 3) {
                                    break;
                                }
                            }
                            textWidth = ctx.measureText(achiveText).width;
                            var ajstX = (calCellWidth - textWidth) / 2;
                            var ajstY = ecal.yokoFlg ? calCellHeight - 4 : calCellHeight - 0;
                            ctx.fillText(achiveText, posCellX + ajstX, posCellY + ajstY);
                        } else {
                            cnt = 0;
                        }
                    }
                }
            }
        });
    }
    eCalendar.prototype.drawMiniCalendar = function () {
        if (!this.yokoFlg && !this.landscape && !this.portrait) {
            return
        }
        const countdownYMD = this.conf["countdown"] ? this.formatYMDSlash(this.conf["countdown"]) : null;
        this.miniCalendarTop = null;
        this.miniCalendarLeft = null;
        this.miniCalendarZIndex = 1000;
        this.miniCalNum = this.landscape ? 3 : 2;
        if (this.init) {
            if (this.rotate == 90) {
                this.miniCalendarTop = this.clockSize;
                this.miniCalendarLeft = 0;
            } else if (this.rotate == 180) {
                this.miniCalendarTop = 0;
                this.miniCalendarLeft = 0;
            } else if (this.rotate == 270) {
                this.miniCalendarTop = 0;
                this.miniCalendarRight = this.docWidthDiff;
            } else if (this.landscape) {
                this.miniCalendarTop = this.calendarHeight;
                this.miniCalendarLeft = this.clockSize;
            } else if (this.portrait) {
                this.miniCalendarTop = this.calendarHeight + this.clockSize;
                this.miniCalendarLeft = 0;
            } else {
                this.miniCalendarTop = this.clockSize;
                this.miniCalendarLeft = 0;
            }
            if (this.yokoFlg) {
                this.miniCalendarAreaHeight = this.calendarHeight;
                this.miniCalendarAreaWidth = this.docWidth - this.calendarWidth;
                this.miniCalendarHeight = this.miniCalendarAreaWidth;
                this.miniCalendarWidth = Math.floor(this.miniCalendarAreaHeight * 7 / (this.miniCalNum * 9));
                this.miniCalendarSpace = Math.floor(this.miniCalendarAreaHeight * 2 / (this.miniCalNum * 9));
                this.miniCalFontSizeM = Math.floor(this.miniCalendarAreaHeight / 16);
                this.miniCalFontSizeD = Math.floor(this.miniCalendarAreaHeight / 42);
                this.miniCalTopPad = Math.floor(this.miniCalendarHeight / 10);
                this.miniCalLeftPad = 0;
            } else if (this.landscape) {
                this.miniCalendarAreaHeight = this.docHeight - this.calendarHeight;
                this.miniCalendarAreaWidth = this.docWidth - this.clockSize;
                this.miniCalendarHeight = this.miniCalendarAreaHeight;
                this.miniCalendarWidth = Math.floor(this.miniCalendarAreaWidth * 7 / (this.miniCalNum * 9));
                this.miniCalendarSpace = Math.floor(this.miniCalendarAreaWidth * 2 / (this.miniCalNum * 9));
                this.miniCalFontSizeM = Math.floor(this.miniCalendarAreaHeight / 6);
                this.miniCalFontSizeD = Math.floor(this.miniCalendarAreaHeight / 12);
                this.miniCalTopPad = Math.floor(this.miniCalendarHeight / 10);
                this.miniCalLeftPad = 0;
            } else if (this.portrait) {
                this.miniCalendarAreaHeight = this.docHeight - this.calendarHeight - this.clockSize;
                this.miniCalendarAreaWidth = this.docWidth;
                this.miniCalendarHeight = this.miniCalendarAreaHeight;
                this.miniCalendarWidth = Math.floor(this.miniCalendarAreaWidth * 7 / (this.miniCalNum * 9));
                this.miniCalendarSpace = Math.floor(this.miniCalendarAreaWidth * 2 / (this.miniCalNum * 9));
                this.miniCalFontSizeM = Math.floor(this.miniCalendarAreaHeight / 6);
                this.miniCalFontSizeD = Math.floor(this.miniCalendarAreaHeight / 12);
                this.miniCalTopPad = Math.floor(this.miniCalendarHeight / 10);
                this.miniCalLeftPad = 0;
            } else {
                this.miniCalendarAreaHeight = 0;
                this.miniCalendarHeight = 0;
                return;
                this.miniCalendarAreaWidth = this.docWidth - this.calendarWidth;
                this.miniCalendarWidth = Math.floor(this.miniCalendarAreaWidth * 7 / (this.miniCalNum * 9));
                this.miniCalendarSpace = Math.floor(this.miniCalendarAreaWidth * 2 / (this.miniCalNum * 9));
                this.miniCalFontSizeM = Math.floor(this.miniCalendarAreaHeight / 16);
                this.miniCalFontSizeD = Math.floor(this.miniCalendarAreaHeight / 42);
                this.miniCalTopPad = Math.floor((this.miniCalendarAreaHeight - this.miniCalendarHeight) * 2 / 8);
                this.miniCalLeftPad = Math.floor((this.miniCalendarAreaWidth - this.miniCalendarWidth * 2) / 3);
            }
            if (this.yokoFlg || this.landscape) {
                this.miniCalendarActHeight = this.miniCalendarHeight - this.miniCalTopPad * 2;
                this.miniCalendarActWidth = this.miniCalendarWidth;
            } else {
                this.miniCalendarActHeight = this.miniCalendarHeight - this.miniCalTopPad * 2;
                this.miniCalendarActWidth = this.miniCalendarWidth;
            }
            var cvs = document.createElement("canvas");
            cvs.id = "miniCalendar";
            cvs.style.zIndex = this.miniCalendarZIndex;
            cvs.style.position = "absolute";
            document.body.appendChild(cvs);
            const mini = document.getElementById('miniCalendar');
            mini.setAttribute("width", this.miniCalendarAreaWidth);
            mini.setAttribute("height", this.miniCalendarAreaHeight);
            mini.style.width = this.miniCalendarAreaWidth + "px";
            mini.style.height = this.miniCalendarAreaHeight + "px";
            if (this.miniCalendarTop) {
                mini.style.top = this.miniCalendarTop + "px";
            } else {
                mini.style.bottom = this.miniCalendarBottom + "px";
            }
            if (this.miniCalendarLeft) {
                mini.style.left = this.miniCalendarLeft + "px";
            } else {
                mini.style.right = this.miniCalendarRight + "px";
            }
            this.miniCalendarCtx = mini.getContext('2d');
            if (this.tmpDate === null) {
                if (this.rotate == 90) {
                    this.miniCalendarCtx.translate(this.miniCalendarAreaWidth, 0);
                } else if (this.rotate == 180) {
                    this.miniCalendarCtx.translate(this.miniCalendarAreaWidth, this.miniCalendarAreaHeight);
                } else if (this.rotate == 270) {
                    this.miniCalendarCtx.translate(0, this.miniCalendarAreaHeight);
                }
                this.miniCalendarCtx.rotate(Math.PI * this.rotate / 180);
            }
        }
        var fontColorM = '#000';
        var fontColorWeekday = '#000';
        var fontColorSaturday = this.isKindle ? '#000' : '#013b9c';
        var fontColorSunday = this.isKindle ? '#000' : '#e40313';
        var cellColorHoliday = this.isKindle ? '#aaa' : null;
        var cellColorCountDown = '#000';
        var calBGColor = '#666';
        const WEEKS = (this.lang == "ja") ? this.weeksJa : this.weeksShort;
        const ctx = this.miniCalendarCtx;
        ctx.fillStyle = calBGColor;
        ctx.fillRect(0, 0, this.yokoFlg ? this.miniCalendarAreaHeight : this.miniCalendarAreaWidth, this.yokoFlg ? this.miniCalendarAreaWidth : this.miniCalendarAreaHeight);
        ctx.fillStyle = "#fff";
        ctx.fillRect(2, 2, this.yokoFlg ? this.miniCalendarAreaHeight - 4 : this.miniCalendarAreaWidth - 4, this.yokoFlg ? this.miniCalendarAreaWidth - 4 : this.miniCalendarAreaHeight - 4);
        const nowY = this.datetime.getFullYear();
        const nowM = this.datetime.getMonth() + 1;
        var textWidth = 0;
        for (var m = 0; m < this.miniCalNum; m++) {
            var date = new Date(nowY, nowM + m, 1);
            var year = date.getFullYear();
            var month = date.getMonth() + 1;
            var startWD = date.getDay();
            var endDate = new Date(year, month, 0).getDate();
            var weekCnt = Math.ceil((endDate + startWD) / 7);
            var rowCnt = weekCnt + 1;
            var miniCalCellWidth = Math.floor((this.miniCalendarActWidth - 7) / 7);
            var miniCalCellHeight = Math.floor((this.miniCalendarActHeight - rowCnt) / rowCnt);
            var posX = this.miniCalLeftPad +
                this.miniCalendarSpace * m +
                this.miniCalendarActWidth * m;
            var posY = this.miniCalTopPad;
            ctx.fillStyle = fontColorM;
            ctx.textBaseline = "top";
            ctx.font = this.miniCalFontSizeM + "px " + this.fontFamily;
            var monthTextWidth = ctx.measureText(month).width;
            var ajstX = (this.miniCalendarSpace - monthTextWidth) / 2;
            ctx.fillText(month, posX + ajstX, posY);
            posX = this.miniCalLeftPad +
                this.miniCalendarSpace * (m + 1) +
                this.miniCalendarActWidth * m;
            posY = this.miniCalTopPad + this.miniCalFontSizeD;
            for (var i = 0; i < WEEKS.length; i++) {
                var W = WEEKS[i];
                if (i !== 0) {
                    posX += miniCalCellWidth;
                }
                ctx.font = (this.miniCalFontSizeD * 14 / 10) + "px " + this.fontFamily;
                ctx.textBaseline = "middle";
                textWidth = ctx.measureText(W).width;
                ajstX = (miniCalCellWidth - textWidth) / 2;
                ctx.fillText(W, posX + ajstX, posY);
            }
            var d = 1;
            posY += this.miniCalTopPad / 4;
            for (var w = 0; w < weekCnt; w++) {
                posX = this.miniCalLeftPad +
                    this.miniCalendarSpace * (m + 1) +
                    this.miniCalendarActWidth * m;
                posY += miniCalCellHeight;
                for (var i = 0; i < this.weeks.length; i++) {
                    var ymd = this.formatYMDSlash(year + "/" + month + "/" + d);
                    if (i !== 0) {
                        posX += miniCalCellWidth;
                    }
                    if (!(w == 0 && i < startWD) && (d <= endDate)) {
                        if (countdownYMD && ymd == countdownYMD) {
                            if (!this.isKindle && i == 6) {
                                ctx.fillStyle = fontColorSaturday;
                            } else if (!this.isKindle && i == 0) {
                                ctx.fillStyle = fontColorSunday;
                            } else {
                                ctx.fillStyle = cellColorCountDown;
                            }
                            ctx.fillRect(posX, posY - miniCalCellHeight / 2, miniCalCellWidth - 2, miniCalCellHeight - 2);
                            if (this.holidayCheck(i, month, d) && this.isKindle) {
                                ctx.fillStyle = cellColorHoliday;
                            } else {
                                ctx.fillStyle = "#fff";
                            }
                            ctx.fillRect(posX + miniCalCellWidth / 20, posY - miniCalCellHeight / 2 + miniCalCellHeight / 20, miniCalCellWidth * 18 / 20 - 2, miniCalCellHeight * 18 / 20 - 2);
                        } else if (this.holidayCheck(i, month, d) && this.isKindle) {
                            ctx.fillStyle = cellColorHoliday;
                            ctx.fillRect(posX, posY - miniCalCellHeight / 2, miniCalCellWidth - 2, miniCalCellHeight - 2);
                        }
                        textWidth = ctx.measureText(d).width;
                        ajstX = (miniCalCellWidth - textWidth) / 2;
                        if (i === 6) {
                            ctx.fillStyle = fontColorSaturday;
                        } else if (this.holidayCheck(i, month, d)) {
                            ctx.fillStyle = fontColorSunday;
                        } else {
                            ctx.fillStyle = fontColorWeekday;
                        }
                        ctx.font = this.miniCalFontSizeD * 1.2 + "px " + this.fontFamily;
                        ctx.fillText(d, posX + ajstX, posY);
                        d++;
                    }
                }
            }
        }
    }
    eCalendar.prototype.clockHandsZIndex = 10000;
    eCalendar.prototype.clockScheduleZIndex = 8000;
    eCalendar.prototype.clockFrameZIndex = 7000;
    eCalendar.prototype.drawClockHands = function () {
        const h = this.datetime.getHours();
        const m = this.datetime.getMinutes();
        const radOutside = this.clockRadSize;
        const lengthH = radOutside * 55 / 100;
        const lengthM = radOutside * 75 / 100;
        const weightH = radOutside * 6 / 90;
        const weightM = radOutside * 3 / 90;
        if (this.init) {
            var cvs = document.createElement("canvas");
            cvs.id = "clockHands";
            cvs.style.zIndex = this.clockHandsZIndex;
            cvs.style.position = "absolute";
            document.body.appendChild(cvs);
        }
        const clock = document.getElementById('clockHands');
        clock.setAttribute("width", this.clockSize);
        clock.setAttribute("height", this.clockSize);
        clock.style.width = this.clockSize + "px";
        clock.style.height = this.clockSize + "px";
        clock.style.top = this.clockTop + "px";
        clock.style.left = this.clockLeft + "px";
        const ctx = clock.getContext('2d');
        ctx.translate(this.clockCenterX, this.clockCenterY);
        ctx.rotate(Math.PI * (this.rotate - 90) / 180);
        ctx.clearRect(-this.clockSize / 2, -this.clockSize / 2, this.clockSize, this.clockSize);
        ctx.strokeStyle = "#000";
        ctx.fillStyle = "#fff";
        ctx.lineCap = "round";
        ctx.save();
        ctx.rotate(Math.PI / 6 * (h + m / 60));
        ctx.lineWidth = weightH;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(lengthH, 0);
        ctx.stroke();
        ctx.restore();
        ctx.save();
        ctx.rotate(Math.PI / 30 * m);
        ctx.lineWidth = weightM;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(lengthM, 0);
        ctx.stroke();
        ctx.restore();
    }
    eCalendar.prototype.drawClockFrame = function () {
        const radOutside = this.clockRadSize * 92 / 100;
        const radOutsideT = radOutside * 321 / 320;
        const radInsideT = 0.87 * radOutside;
        const radInsideH = 0.85 * radOutside;
        const radInsideM = 0.90 * radOutside;
        const radCenterArk = 0.05 * radOutside;
        const weightT = radOutside * 80 / 846;
        const weightH = radOutside * 50 / 846;
        const weightM = radOutside * 20 / 846;
        const clkOutside = this.clockRadSize * 1.01;
        if (this.init) {
            var cvs = document.createElement("canvas");
            cvs.id = "clockFrame";
            cvs.style.zIndex = this.clockFrameZIndex;
            cvs.style.position = "absolute";
            document.body.appendChild(cvs);
        }
        const clockFrame = document.getElementById('clockFrame');
        clockFrame.setAttribute("width", this.clockSize);
        clockFrame.setAttribute("height", this.clockSize);
        clockFrame.style.width = this.clockSize + "px";
        clockFrame.style.height = this.clockSize + "px";
        clockFrame.style.top = this.clockTop + "px";
        clockFrame.style.left = this.clockLeft + "px";
        const ctx = clockFrame.getContext('2d');
        ctx.translate(this.clockCenterX, this.clockCenterY);
        ctx.rotate(Math.PI * 270 / 180);
        ctx.clearRect(-this.clockSize / 2, -this.clockSize / 2, this.clockSize, this.clockSize);
        ctx.fillStyle = "#fff";
        ctx.lineCap = "butt";
        ctx.save();
        ctx.beginPath();
        ctx.fillStyle = "#fff";
        ctx.arc(0, 0, clkOutside, 0 * Math.PI / 180, Math.PI * 360 / 180, false);
        ctx.fill();
        ctx.rotate(Math.PI * this.rotate / 180);
        for (var i = 0; i < 60; i++) {
            ctx.strokeStyle = "#000";
            if (i == 0) {
                ctx.beginPath();
                ctx.lineWidth = Math.floor(weightT);
                ctx.moveTo(radInsideT, 0);
                ctx.lineTo(radOutsideT, 0);
                ctx.stroke();
                ctx.lineWidth = Math.floor(weightT * 2 / 8);
                ctx.moveTo(radInsideT, 0);
                ctx.lineTo(radOutsideT, 0);
                ctx.strokeStyle = "#fff";
                ctx.stroke();
            } else {
                ctx.beginPath();
                if (i % 5 == 0) {
                    ctx.lineWidth = Math.floor(weightH);
                    ctx.moveTo(radInsideH, 0);
                    ctx.lineTo(radOutside, 0);
                } else {
                    if ([1, 59].indexOf(i) !== -1) {
                        ctx.strokeStyle = "#ccc";
                    }
                    ctx.lineWidth = Math.floor(weightM);
                    ctx.moveTo(radInsideM, 0);
                    ctx.lineTo(radOutside, 0);
                }
                ctx.stroke();
            }
            ctx.rotate(Math.PI / 30);
        }
        ctx.beginPath();
        ctx.arc(0, 0, radCenterArk, 0, 2 * Math.PI, false);
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.restore();
    }
    eCalendar.prototype.schedules = [];
    eCalendar.prototype.preSchedules = null;
    eCalendar.prototype.drawClockSchedule = function (forceUpdate) {
        const radOutside = this.clockRadSize * 96 / 100;
        const radInsideH = 0.85 * radOutside;
        const lineWidth = radOutside * 0.02;
        const fontColorUntil10 = "#aaa";
        const fontColorUntil5 = "#999";
        const fontColorUntil3 = "#666";
        const fontColorUntil2 = "#333";
        const fontColorUntil1 = "#111";
        const fontSizeUntil = this.isKindle ? Math.floor(this.clockSize / 8) : Math.floor(this.clockSize / 10);
        const fontSizeUntilT = this.isKindle ? Math.floor(this.clockSize / 15) : Math.floor(this.clockSize / 20);
        const posXUntil = this.isKindle ? -radInsideH * 7 / 10 : -radInsideH * 8 / 10;
        if (this.init) {
            var cvs = document.createElement("canvas");
            cvs.id = "clockSchedule";
            cvs.style.zIndex = this.clockScheduleZIndex;
            cvs.style.position = "absolute";
            document.body.appendChild(cvs);
            const clockSchedule = document.getElementById('clockSchedule');
            clockSchedule.setAttribute("width", this.clockSize);
            clockSchedule.setAttribute("height", this.clockSize);
            clockSchedule.style.width = this.clockSize + "px";
            clockSchedule.style.height = this.clockSize + "px";
            clockSchedule.style.top = this.clockTop + "px";
            clockSchedule.style.left = this.clockLeft + "px";
            this.clockScheduleCtx = clockSchedule.getContext('2d');
        }
        const ctx = this.clockScheduleCtx;
        if (this.init) {
            ctx.translate(this.clockCenterX, this.clockCenterY);
            ctx.rotate(Math.PI * 270 / 180);
        }
        var ecal = this;
        var d = new Date();
        // TODO - Fix this
        // $.ajax({
        //     type: "GET",
        //     url: "http://ecal.ink/api/gascal-get/?" + d.getTime(),
        //     success: function (msg) {
        //         if (msg.length) {
        //             ecal.schedules = msg.split(",");
        //         } else {
        //             ecal.schedules = [];
        //         }
        //         var until = null;
        //         if (ecal.schedules.length) {
        //             var nowtime = Math.floor(ecal.datetime.getTime() / 1000);
        //             var nextscheduletime = null;
        //             for (var i = 0; i < ecal.schedules.length; i++) {
        //                 var scheduletime = ecal.schedules[i];
        //                 var nextDT = new Date(scheduletime * 1000);
        //                 var osTzOffset = new Date().getTimezoneOffset();
        //                 nextDT.setTime(nextDT.getTime() + (osTzOffset * 60 + ecal.tzoffset) * 1000);
        //                 scheduletime = Math.floor(nextDT.getTime() / 1000);
        //                 var min15 = 60 * 15;
        //                 if (scheduletime < nowtime) {
        //                     var df = nowtime - scheduletime;
        //                     if (df < min15) {
        //                         break;
        //                     }
        //                 } else {
        //                     var df = scheduletime - nowtime;
        //                     if (df < min15) {
        //                         nextscheduletime = ecal.schedules[i];
        //                         break;
        //                     }
        //                 }
        //             }
        //             if (nextscheduletime) {
        //                 var nextDT = new Date(nextscheduletime * 1000);
        //                 var osTzOffset = new Date().getTimezoneOffset();
        //                 nextDT.setTime(nextDT.getTime() + (osTzOffset * 60 + ecal.tzoffset) * 1000);
        //                 nextscheduletime = Math.floor(nextDT.getTime() / 1000);
        //                 if (nextscheduletime > nowtime) {
        //                     until = Math.ceil((nextscheduletime - nowtime) / 60);
        //                 }
        //             }
        //         }
        //         if (!until && !forceUpdate && ecal.schedules == ecal.preSchedules) {
        //             return;
        //         }
        //         ecal.preSchedules = ecal.schedules;
        //         ctx.clearRect(-ecal.clockSize / 2, -ecal.clockSize / 2, ecal.clockSize, ecal.clockSize);
        //         if (until && until <= 10) {
        //             ctx.save();
        //             ctx.rotate(Math.PI * (ecal.rotate - 270) / 180);
        //             ctx.font = fontSizeUntil + "px " + ecal.fontFamily;
        //             if (until <= 1) {
        //                 ctx.fillStyle = fontColorUntil1;
        //             } else if (until <= 2) {
        //                 ctx.fillStyle = fontColorUntil2;
        //             } else if (until <= 3) {
        //                 ctx.fillStyle = fontColorUntil3;
        //             } else if (until <= 5) {
        //                 ctx.fillStyle = fontColorUntil5;
        //             } else {
        //                 ctx.fillStyle = fontColorUntil10;
        //             }
        //             ctx.textBaseline = "top";
        //             var textWidth = null;
        //             textWidth = ctx.measureText(until).width;
        //             var untilX = 0;
        //             var untilY = posXUntil;
        //             ctx.translate(untilX, untilY);
        //             ctx.fillText(until, -textWidth / 2, 0);
        //             ctx.font = fontSizeUntilT + "px " + ecal.fontFamily;
        //             var txt = (until == 0 || until == 1) ? "minute" : "minutes";
        //             textWidth = ctx.measureText(txt).width;
        //             ctx.fillText(txt, -textWidth / 2, fontSizeUntil);
        //             ctx.restore();
        //         }
        //         ctx.save();
        //         ctx.lineCap = "butt";
        //         ctx.lineWidth = lineWidth;
        //         var start = new Date();
        //         start.setMinutes(0);
        //         start.setSeconds(0);
        //         start.setMilliseconds(0);
        //         var startH = start.getHours();
        //         var startUnix = Math.floor(start.getTime() / 1000);
        //         var osTzOffset = new Date().getTimezoneOffset();
        //         var tzAjst = (osTzOffset / 60 + ecal.tzoffset / 3600) * Math.PI * 360 / 12;
        //         var blockAjst, preSet, initStrokeStyle;
        //         for (var i = 0; i < 96; i++) {
        //             var t;
        //             t = startUnix + i * 15 * 60;
        //             var dt = new Date(t * 1000);
        //             ctx.beginPath();
        //             if (ecal.schedules.indexOf(t.toString()) !== -1) {
        //                 blockAjst = (preSet) ? -2 : 2;
        //                 ctx.strokeStyle = (i <= 47) ? "#333" : "#ccc";
        //                 preSet = 1;
        //             } else if (i > 47) {
        //                 continue;
        //             } else {
        //                 blockAjst = (!preSet) ? -2 : 2;
        //                 ctx.strokeStyle = "#ccc";
        //                 preSet = 0;
        //             }
        //             if (i == 0) {
        //                 initStrokeStyle = ctx.strokeStyle;
        //             }
        //             var startAjst = (startH % 12) * 360 * Math.PI / 12;
        //             s = ((Math.PI * (360 / 48 * i) + blockAjst) +
        //                 (Math.PI * ecal.rotate) + startAjst + tzAjst) / 180;
        //             if (i < 47) {
        //                 e = ((Math.PI * (360 / 48 * (i + 1)) - 2) +
        //                     (Math.PI * ecal.rotate) + startAjst + tzAjst) / 180;
        //                 ctx.arc(0, 0, radOutside + lineWidth / 2, s, e, false);
        //                 ctx.stroke();
        //             }
        //             if (i > 47) {
        //                 ctx.lineWidth = lineWidth * 1.5;
        //                 e = ((Math.PI * (360 / 48 * (i + 1)) - 2) +
        //                     (Math.PI * ecal.rotate) + startAjst + tzAjst) / 180;
        //                 ctx.arc(0, 0, radOutside + lineWidth * 4, s, e, false);
        //                 ctx.stroke();
        //             } else if (i == 47) {
        //                 s2 = ((Math.PI * (360 / 48 * (i)) + blockAjst - 1) +
        //                     (Math.PI * ecal.rotate) + startAjst + tzAjst) / 180;
        //                 ctx.lineWidth = 1;
        //                 ctx.fillStyle = ctx.strokeStyle;
        //                 e = ((Math.PI * (360 / 48 * (i + 1 - 0.4)) - 2) +
        //                     (Math.PI * ecal.rotate) + startAjst + tzAjst) / 180;
        //                 ctx.arc(0, 0, radOutside, s, e, false);
        //                 ctx.arc(0, 0, radOutside + lineWidth * 2, s2, s, false);
        //                 ctx.arc(0, 0, radOutside, s2, s, false);
        //                 ctx.fill();
        //                 ctx.stroke();
        //                 ctx.beginPath();
        //                 ctx.lineWidth = lineWidth;
        //                 e = ((Math.PI * (360 / 48 * (i + 1 + 0.1))) +
        //                     (Math.PI * ecal.rotate) + startAjst + tzAjst) / 180;
        //                 var x = Math.cos(e) * (radOutside + lineWidth / 2);
        //                 var y = Math.sin(e) * (radOutside + lineWidth / 2);
        //                 ctx.strokeStyle = initStrokeStyle;
        //                 ctx.fillStyle = "#fff";
        //                 ctx.arc(x, y, lineWidth * 1.2, 0, 2 * Math.PI, true);
        //                 ctx.fill();
        //                 ctx.stroke();
        //             }
        //         }
        //         ctx.restore();
        //     }
        // });
    }
    eCalendar.prototype.drawDatearea = function () {
        if (this.rotate == 90) {
            this.dateareaTop = 0;
            this.dateareaRight = this.docWidthDiff;
        } else if (this.rotate == 180) {
            this.dateareaTop = (this.docHeight - this.dateareaHeight);
            this.dateareaLeft = (this.docWidth - this.dateareaWidth);
        } else if (this.rotate == 270) {
            this.dateareaTop = (this.docHeight - this.dateareaHeight);
            this.dateareaLeft = 0;
        } else if (this.landscape) {
            this.dateareaTop = 0;
            this.dateareaLeft = 0;
        } else {
            this.dateareaTop = 0;
            this.dateareaLeft = 0;
        }
        if (this.init) {
            var cvs = document.createElement("canvas");
            cvs.id = "datearea";
            cvs.style.zIndex = 20000;
            cvs.style.position = "absolute";
            document.body.appendChild(cvs);
            const datearea = document.getElementById('datearea');
            datearea.setAttribute("width", this.dateareaWidth);
            datearea.setAttribute("height", this.dateareaHeight);
            datearea.style.width = this.dateareaWidth + "px";
            datearea.style.height = this.dateareaHeight + "px";
            if (this.dateareaTop) {
                datearea.style.top = this.dateareaTop + "px";
            } else {
                datearea.style.bottom = this.dateareaBottom + "px";
            }
            if (this.dateareaLeft) {
                datearea.style.left = this.dateareaLeft + "px";
            } else {
                datearea.style.right = this.dateareaRight + "px";
            }
            this.dateareaCtx = datearea.getContext('2d');
            if (this.rotate == 90) {
                this.dateareaCtx.translate(this.dateareaWidth, 0);
            } else if (this.rotate == 180) {
                this.dateareaCtx.translate(this.dateareaWidth, this.dateareaHeight);
            } else if (this.rotate == 270) {
                this.dateareaCtx.translate(0, this.dateareaHeight);
            }
            this.dateareaCtx.rotate(Math.PI * this.rotate / 180);
        }
        const ctx = this.dateareaCtx;
        ctx.clearRect(0, 0, this.dateareaWidth, this.dateareaHeight);
        ctx.fillStyle = "#000";
        ctx.strokeStyle = "#fff";
        ctx.lineJoin = "round";
        const WEEKS = (this.lang == "ja") ? this.weeksJaFull : this.weeksFull;
        var Y = this.datetime.getFullYear();
        var R = Y - 2018;
        var M = this.datetime.getMonth() + 1;
        var D = this.datetime.getDate();
        var W = WEEKS[this.datetime.getDay()];
        var S = " / ";
        var textActiveWidth = 0;
        ctx.font = this.dateFontSizeY + "px " + this.fontFamily;
        textActiveWidth += ctx.measureText(Y).width;
        ctx.font = this.dateFontSizeM + "px " + this.fontFamily;
        textActiveWidth += ctx.measureText(M).width;
        ctx.font = this.dateFontSizeS + "px " + this.fontFamily;
        textActiveWidth += ctx.measureText(S).width;
        ctx.font = this.dateFontSizeD + "px " + this.fontFamily;
        textActiveWidth += ctx.measureText(D).width;
        var paddingLeft = this.yokoFlg || this.landscape ? (this.clockSize - textActiveWidth) / 2 : (this.docWidth + this.clockSize / 8 - this.clockSize - textActiveWidth) / 2;
        var paddingTop = this.dateFontSizeY * 4 / 5;
        var posX = paddingLeft;
        var posY = 0;
        var textWidth = 0;
        ctx.font = this.dateFontSizeY + "px " + this.fontFamily;
        ctx.textBaseline = "alphabetic";
        posY = paddingTop + this.dateFontSizeM * 29 / 40;
        ctx.lineWidth = this.dateFontSizeY / 6;
        ctx.strokeText(Y, posX, posY);
        ctx.fillText(Y, posX, posY);
        textWidth = ctx.measureText(Y).width;
        posX += textWidth;
        ctx.font = this.dateFontSizeM + "px " + this.fontFamily;
        ctx.textBaseline = "alphabetic";
        textWidth = ctx.measureText(M).width;
        if (M < 10) {
            posX += textWidth * 2 / 5;
        }
        ctx.strokeText(M, posX, posY);
        ctx.fillText(M, posX, posY);
        ctx.font = this.dateFontSizeS + "px " + this.fontFamily;
        ctx.lineWidth = this.dateFontSizeM / 10;
        ctx.textBaseline = "alphabetic";
        posY = paddingTop + this.dateFontSizeM * 29 / 40;
        posX += textWidth;
        ctx.strokeText(S, posX, posY);
        ctx.fillText(S, posX, posY);
        textWidth = ctx.measureText(S).width;
        var posXD;
        posY = paddingTop + (this.dateFontSizeM + this.dateFontSizeW) * 9 / 10;
        posX += textWidth;
        ctx.font = this.dateFontSizeD + "px " + this.fontFamily;
        ctx.textBaseline = "alphabetic";
        textWidth = ctx.measureText(D).width;
        ctx.lineWidth = this.dateFontSizeM / 8;
        posXD = posX;
        ctx.strokeText(D, posX, posY);
        ctx.fillText(D, posX, posY);
        ctx.textBaseline = "alphabetic";
        ctx.font = this.dateFontSizeW + "px " + this.fontFamily;
        textWidth = ctx.measureText(W).width;
        ctx.lineWidth = this.dateFontSizeW / 8;
        posX = this.yokoFlg || this.landscape ? (posXD - paddingLeft - textWidth) / 2 + paddingLeft : (posXD - paddingLeft - textWidth) / 2 + paddingLeft * 5 / 6;
        ctx.strokeText(W, posX, posY);
        ctx.fillText(W, posX, posY);
        if (this.lang == "ja") {
            const RText = "令和" + R + "年";
            ctx.textBaseline = "top";
            ctx.font = this.dateFontSizeR + "px " + this.fontFamily;
            posX = paddingLeft;
            posY = paddingTop;
            if (this.isMac) {
                posY += ctx.measureText(D).actualBoundingBoxAscent;
            }
            ctx.strokeText(RText, posX, posY);
            ctx.fillText(RText, posX, posY);
        }
    }
    eCalendar.prototype.animalImages = ['cat01', 'cat02', 'dog01', 'dog02'];
    eCalendar.prototype.roomImages = ['room01', 'room01'];
    eCalendar.prototype.drawImage = function (imageType) {
        this.chk = '';
        const imgW = (this.yokoFlg) ? this.dateareaHeight : this.docWidth - this.clockSize;
        const imgH = (this.yokoFlg) ? this.dateareaWidth : this.docHeight - this.calendarHeight - this.miniCalendarHeight;
        if (!imageType) {
            imageType = "images_rooms";
        }
        var images, cnt, idx, imageURL;
        if (imageType == "tsundoku") {
            images = this.tsundokuImages.length;
            imageFile = imageType;
            imageURL = "/imgs-ecal/" + imageFile + ".png?" + this.chk;
        } else {
            if (imageType == "images_custom") {
                images = this.conf["images_custom"];
            } else if (imageType == "images_animals") {
                images = this.animalImages;
            } else {
                images = this.roomImages;
            }
            cnt = images.length;
            idx = Math.floor(Math.random() * cnt);
            imageFile = images[idx];
            if (imageFile == "room01") {
                if (this.yokoFlg) {
                    imageFile = "room_vert_01";
                } else {
                    imageFile = "room_horizon_01";
                }
            }
            if (imageType == "images_custom") {
                imageURL = imageFile;
            } else {
                imageURL = "/imgs-ecal/" + imageFile + ".png?" + this.chk;
            }
        }
        var img = document.createElement("img");
        img.style.position = "absolute";
        img.style["-webkit-transform"] = "rotate(" + this.rotate + "deg)";
        img.setAttribute("src", imageURL);
        var btmPadding = imgW * 1 / 22;
        var lftPadding = imgW * 2 / 18;
        if (imageType == "images_rooms" || imageType == "images_custom") {
            btmPadding = 0;
            lftPadding = 0;
        }
        var imgArea = document.getElementById('background');
        if (this.yokoFlg) {
            imgArea.style.width = this.docWidth + "px";
            imgArea.style.height = this.clockSize + "px";
            imgArea.style.overflow = "hidden";
            img.style["-webkit-transform-origin"] = "left bottom";
            img.style.width = this.clockSize + "px";
            if (this.rotate == 90) {
                img.style.bottom = this.clockSize + "px";
                img.style.left = btmPadding + "px";
            } else if (this.rotate == 270) {
                imgArea.style.top = this.calendarHeight + "px";
                imgArea.style.right = this.docWidthDiff + "px";
                img.style.bottom = 0 + "px";
                img.style.right = -this.clockSize + btmPadding + "px";
            }
        } else if (this.landscape) {
            imgArea.style.width = this.clockSize + "px";
            imgArea.style.height = this.docHeight + "px";
            imgArea.style.overflow = "hidden";
            if (imageType == "images_custom") {
                img.style.height = "100%";
                img.style.width = this.clockSize + "px";
                img.style.bottom = 0 + "px";
            } else if (imageType == "tsundoku") {
                img.style.width = "100%";
                img.style.bottom = 10 + "px";
            } else {
                img.style.bottom = 0 + "px";
            }
            img.style.objectFit = "cover";
        } else {
            if (imageType == "images_rooms") {
                img.style.height = "auto";
                img.style.width = this.docWidth + "px";
            } else if (imageType == "images_custom") {
                if (this.isKindle == 1) {
                    img.style.height = "auto";
                } else {
                    img.style.height = this.clockSize + "px";
                    img.style.objectFit = "cover";
                }
                img.style.width = this.docWidth + "px";
            } else {
                img.style.width = this.docWidth - this.clockSize + "px";
            }
            imgArea.style.width = this.docWidth;
            imgArea.style.height = this.clockSize + "px";
            if (this.rotate == 180) {
                imgArea.style.top = this.calendarHeight + "px";
                imgArea.style.right = this.docWidthDiff + "px";
                img.style.top = btmPadding + "px";
                img.style.right = lftPadding + "px";
            } else {
                imgArea.style.top = 0 + "px";
                imgArea.style.left = 0 + "px";
                img.style.bottom = btmPadding + "px";
                img.style.left = lftPadding + "px";
            }
        }
        this.removeAllChildren(imgArea);
        imgArea.appendChild(img);
    }
    eCalendar.prototype.randomFrequency = function (items) {
        var itemCount = items.length;
        var newItems = [];
        for (var i = 0; i < itemCount; i++) {
            for (var j = 0; j < items[i][1]; j++) {
                newItems.push(items[i][0]);
            }
        }
        if (newItems.length) {
            r = Math.floor(Math.random() * newItems.length);
            return newItems[r];
        } else {
            return null;
        }
    }
    eCalendar.prototype.drawRandomSpace = function () {
        var items = [];
        if (this.conf["countdown"] && this.conf["countdown"] != "") {
            items.push(["countdown", 5]);
        }
        if (this.conf["images"] && this.conf["images"].length) {
            if (this.conf["images"].indexOf("animals") !== -1) {
                items.push(["images_animals", this.animalImages.length]);
            }
            if (this.conf["images"].indexOf("rooms") !== -1) {
                items.push(["images_rooms", this.roomImages.length]);
            }
        }
        if (this.conf["images_custom"] && this.conf["images_custom"].length) {
            items.push(["images_custom", this.conf["images_custom"].length]);
        }
        if (this.conf["tsundoku"] && this.conf["tsundoku"].length) {
            items.push(["tsundoku", this.conf["tsundoku"].length]);
        }
        if (items.length == 0) {
            return;
        }
        var item = this.randomFrequency(items);
        this.clearRandomSpace();
        if (item.indexOf("images_") === 0) {
            this.drawImage(item);
        } else if (item == "countdown") {
            this.drawCountDown(this.conf["countdown"]);
        } else if (item == "tsundoku") {
            this.drawTsundoku();
            this.drawImage("tsundoku");
        }
    }
    eCalendar.prototype.clearRandomSpace = function () {
        var tArea = document.getElementById('foreground');
        tArea.style["-webkit-transform-origin"] = "left top";
        tArea.style["-webkit-transform"] = "rotate(0deg)";
        tArea.style["text-align"] = "";
        tArea.style.padding = "";
        tArea.style.top = "";
        tArea.style.left = "";
        tArea.style.right = "";
        tArea.style.width = "";
        tArea.style.height = "";
        this.removeAllChildren(document.getElementById('foreground'));
        this.removeAllChildren(document.getElementById('background'));
    }
    eCalendar.prototype.tsundokuImages = ['tsundoku'];
    eCalendar.prototype.drawTsundoku = function () {
        var imgW, imgH;
        if (this.landscape) {
            imgW = this.dateareaWidth;
            imgH = this.docHeight - this.activeDateareaH - this.clockSize;
        } else if (this.yokoFlg) {
            imgW = this.dateareaHeight;
            imgH = this.dateareaWidth;
        } else {
            imgW = this.docWidth - this.clockSize;
            imgH = this.docHeight - this.calendarHeight - this.activeDateareaH;
        }
        const tList = this.conf["tsundoku"];
        const tCnt = tList.length;
        const tIdx = Math.floor(Math.random() * tCnt);
        var title = tList[tIdx]["title"];
        var chosya = tList[tIdx]["authors"];
        var fontSizeAjstT = 1;
        if (title.length < 3) {
            fontSizeAjstT = 2;
        }
        var fontSizeAjstC = 1;
        if (chosya.length < 8) {
            fontSizeAjstC = 1.4;
        }
        const fontSizeT = this.yokoFlg ? Math.floor(this.calendarHeight / 16 * fontSizeAjstT) : Math.floor(this.calendarHeight / 14 * fontSizeAjstT);
        const lineHeightT = fontSizeT;
        const paddingT = fontSizeT / 6;
        const fontSizeC = this.yokoFlg ? Math.floor(this.calendarHeight / 22 * fontSizeAjstC) : Math.floor(this.calendarHeight / 18 * fontSizeAjstC);
        const lineHeightC = fontSizeC;
        const paddingC = fontSizeC / 6;
        if (this.landscape) {
            tAreaW = imgW - paddingT * 2;
            tAreaH = (this.docHeight - this.activeClockH - this.activeDateareaH) * 6 / 10;
            tAreaTop = this.activeDateareaH + this.activeClockH;
            tAreaLeft = 0;
        } else if (this.yokoFlg) {
            tAreaW = this.clockSize * 19 / 20;
            tAreaH = this.docWidth - this.clockSize - this.activeDateareaH - paddingT * 2;
            if (this.rotate == 90) {
                tAreaTop = 0;
                tAreaLeft = this.docWidth - this.clockSize - this.activeDateareaH * 3 / 4;
            } else if (this.rotate == 270) {
                tAreaTop = this.docHeight;
                tAreaLeft = this.clockSize + this.activeDateareaH * 3 / 4;
            }
        } else {
            tAreaW = imgW;
            tAreaH = this.clockSize - this.activeDateareaH;
            if (this.rotate == 180) {
                tAreaTop = this.docHeight - this.activeDateareaH;
                tAreaLeft = this.docWidth - paddingT * 2;
            } else {
                tAreaTop = this.activeDateareaH;
                tAreaLeft = paddingT * 2;
            }
        }
        var tArea = document.getElementById('foreground');
        tArea.style["-webkit-transform-origin"] = "left top";
        tArea.style["-webkit-transform"] = "rotate(" + this.rotate + "deg)";
        tArea.style.width = tAreaW + "px";
        tArea.style.height = tAreaH + "px";
        tArea.style.top = tAreaTop + "px";
        tArea.style.left = tAreaLeft + "px";
        var divTitle = document.createElement("div");
        divTitle.style.width = tAreaW + "px";
        divTitle.style["position"] = "relative";
        divTitle.style["line-height"] = lineHeightT + "px";
        divTitle.style["font-weight"] = "bold";
        divTitle.style["font-size"] = fontSizeT + "px";
        divTitle.style["text-align"] = "center";
        divTitle.style["padding"] = paddingT + "px";
        divTitle.innerHTML = title;
        var divChosya = document.createElement("div");
        divChosya.style.width = tAreaW + "px";
        divChosya.style["position"] = "relative";
        divChosya.style["line-height"] = lineHeightC + "px";
        divChosya.style["font-weight"] = "bold";
        divChosya.style["font-size"] = fontSizeC + "px";
        divChosya.style["text-align"] = "center";
        divChosya.style["padding"] = paddingC + "px";
        var divTsundoku = document.createElement("div");
        divTsundoku.style.width = this.clockSize;
        divTsundoku.style.position = "absolute";
        if (this.landscape) {
            divTsundoku.style.top = "90%";
            divTsundoku.style["transform"] = "translateY(-90%)";
        } else if (this.yokoFlg) {
            divTsundoku.style.top = "30%";
            divTsundoku.style["-webkit-transform"] = "translateY(-30%)";
        } else {
            divTsundoku.style.top = "30%";
            divTsundoku.style["-webkit-transform"] = "translateY(-30%)";
        }
        divTsundoku.appendChild(divTitle);
        if (chosya.length) {
            divChosya.innerHTML = chosya;
            divTsundoku.appendChild(divChosya);
        }
        tArea.appendChild(divTsundoku);
    }
    eCalendar.prototype.drawCountDown = function () {
        const countdownYMD = this.formatYMDSlash(this.conf["countdown"]);
        const padding = this.clockSize / 50;
        if (this.landscape) {
            tAreaW = this.clockSize - padding * 2;
            tAreaH = (this.docHeight - this.activeClockH - this.activeDateareaH);
            tAreaTop = this.activeDateareaH + this.activeClockH;
            tAreaLeft = 0;
        } else if (this.yokoFlg) {
            tAreaW = this.clockSize;
            tAreaH = this.docWidth - this.clockSize - this.activeDateareaH - padding * 2;
            if (this.rotate == 90) {
                tAreaTop = 0;
                tAreaLeft = this.docWidth - this.clockSize - this.activeDateareaH;
            } else if (this.rotate == 270) {
                tAreaTop = this.docHeight;
                tAreaLeft = this.clockSize + this.activeDateareaH;
            }
        } else {
            tAreaW = this.docWidth - this.clockSize - padding * 2;
            tAreaH = this.clockSize - this.activeDateareaH;
            if (this.rotate == 180) {
                tAreaTop = this.docHeight - this.activeDateareaH;
                tAreaLeft = this.docWidth;
            } else {
                tAreaTop = this.activeDateareaH;
                tAreaLeft = 0;
            }
        }
        const fontSizeCount = this.yokoFlg ? Math.floor(tAreaH / 3) : Math.floor(tAreaH / 4);
        const lineHeightCount = fontSizeCount * 4 / 7;
        const fontSizeToGo = this.yokoFlg ? Math.floor(tAreaH / 9) : Math.floor(tAreaH / 11);
        const lineHeightToGo = fontSizeToGo * 4 / 5;
        const fontSize = this.yokoFlg ? Math.floor(tAreaH / 7) : Math.floor(tAreaH / 8);
        const lineHeight = fontSize;
        var tArea = document.getElementById('foreground');
        tArea.style["-webkit-transform-origin"] = "left top";
        tArea.style["-webkit-transform"] = "rotate(" + this.rotate + "deg)";
        tArea.style.width = tAreaW + "px";
        tArea.style.height = tAreaH + "px";
        tArea.style.top = tAreaTop + "px";
        tArea.style.left = tAreaLeft + "px";
        var countdownDt = new Date(countdownYMD);
        var left = Math.ceil((countdownDt - this.datetime) / 86400000);
        var divCount = document.createElement("div");
        divCount.style.width = tAreaW + "px";
        divCount.style["position"] = "relative";
        divCount.style["line-height"] = lineHeightCount + "px";
        divCount.style["font-weight"] = "bold";
        divCount.style["font-size"] = fontSizeCount + "px";
        divCount.style["font-family"] = this.fontFamily;
        divCount.style["text-align"] = "center";
        divCount.style["padding"] = padding + "px";
        if (left > 0) {
            divCount.innerHTML = left;
        } else {
            divCount.innerHTML = "Today";
        }
        var divDaysToGo = document.createElement("div");
        divDaysToGo.style.width = tAreaW + "px";
        divDaysToGo.style["position"] = "relative";
        divDaysToGo.style["line-height"] = lineHeightToGo + "px";
        divDaysToGo.style["font-weight"] = "bold";
        divDaysToGo.style["font-size"] = fontSizeToGo + "px";
        divDaysToGo.style["font-family"] = this.fontFamily;
        divDaysToGo.style["text-align"] = "center";
        divDaysToGo.style["padding"] = padding + "px";
        if (left > 0) {
            divDaysToGo.innerHTML = (left == 1) ? "day to go" : "days to go";
        } else {
            divDaysToGo.innerHTML = "is the day !";
        }
        var divYMD = document.createElement("div");
        divYMD.style.width = tAreaW + "px";
        divYMD.style["position"] = "relative";
        divYMD.style["line-height"] = lineHeight + "px";
        divYMD.style["font-weight"] = "bold";
        divYMD.style["font-size"] = fontSize + "px";
        divYMD.style["font-family"] = this.fontFamily;
        divYMD.style["text-align"] = "center";
        divYMD.style["padding"] = padding + "px";
        divYMD.innerHTML = countdownYMD;
        if (this.conf["countdown_title"]) {
            var divTitle = document.createElement("div");
            divTitle.style.width = tAreaW + "px";
            divTitle.style["position"] = "relative";
            divTitle.style["line-height"] = lineHeight + "px";
            divTitle.style["font-weight"] = "bold";
            divTitle.style["font-size"] = fontSize + "px";
            divTitle.style["font-family"] = this.fontFamily;
            divTitle.style["text-align"] = "center";
            divTitle.style["padding"] = padding + "px";
            divTitle.innerHTML = this.hsc(this.conf["countdown_title"]);
        }
        if (left == 1) {
            var imgAlarm = document.createElement("img");
            imgAlarm.src = "/img/alarm.svg";
            imgAlarm.style.position = "absolute";
            imgAlarm.style.width = fontSizeCount + "px";
            imgAlarm.style.top = 0;
            imgAlarm.style.left = (tAreaW / 11) + "px";
        }
        var divCountDown = document.createElement("div");
        divCountDown.style.width = this.clockSize;
        divCountDown.style.position = "absolute";
        var clr = "fff";
        var siz = 5;
        var txtS = siz + "px " + siz + "px 0 #" + clr + ", -" + siz + "px -" + siz + "px 0 #" + clr + ", " +
            "-" + siz + "px " + siz + "px 0 #" + clr + ", " + siz + "px -" + siz + "px 0 #" + clr + ", " +
            "0px " + siz + "px 0 #" + clr + ", 0 -" + siz + "px 0 #" + clr + ", " +
            "-" + siz + "px 0 0 #" + clr + ", " + siz + "px 0 0 #" + clr;
        divCountDown.style["text-shadow"] = txtS;
        if (this.landscape) {
            divCountDown.style.top = "90%";
            divCountDown.style["transform"] = "translateY(-90%)";
        } else if (this.yokoFlg) {
            divCountDown.style.top = "30%";
            divCountDown.style["-webkit-transform"] = "translateY(-30%)";
        } else {
            divCountDown.style.left = "5%";
            divCountDown.style["-webkit-transform"] = "translateX(-5%)";
            divCountDown.style.top = "55%";
            divCountDown.style["-webkit-transform"] = "translateY(-55%)";
        }
        divCountDown.appendChild(divCount);
        divCountDown.appendChild(divDaysToGo);
        divCountDown.appendChild(divYMD);
        if (this.conf["countdown_title"]) {
            divCountDown.appendChild(divTitle);
        }
        if (left == 1) {
            divCountDown.appendChild(imgAlarm);
        }
        tArea.appendChild(divCountDown);
    }
    eCalendar.prototype.version = 0.1;
    var ecal = new eCalendar();
    var d = new Date();
    $.ajax('http://ecal.ink/api/config/?' + d.getTime(), {
        type: 'get',
        dataType: 'json',
        cache: false,
    }).success(function (conf) {
        ecal.start('us', -28800, conf, 1);
    }).error(function (err, msg) {
        //TODO - Fix this later
        ecal.start('us', -28800, { "version": "0.1", "images": [], "tsundoku": [], "rotate": "90", "timezone": "America\/Los_Angeles", "lang": "en" }, 1);


        // var msg = "Error!<br>" + msg + "<br>";
        // Object.keys(err).forEach(function (k) {
        //     if (typeof err[k] == 'string' || err[k] instanceof String) {
        //         msg += k + ":" + err[k] + "<br>";
        //     } else if (typeof err[k] == 'number') {
        //         msg += k + ":" + err[k] + "<br>";
        //     } else {
        //         msg += k + "<br>";
        //     }
        // });
        // $('<div>', {
        //     id: 'msg',
        //     style: 'z-index:10000000;position:absolute;background-color:#fff;'
        // }).appendTo('body');
        // $('#msg').html(msg);
    });
} catch (err) {
    $.ajax({
        type: "GET",
        url: "http://ecal.ink/api/error/?" + err,
        dataType: "json",
        success: function (conf) {
            ecal.start('us', -28800, conf, 1);
        }
    });
}