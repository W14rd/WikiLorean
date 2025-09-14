months = [
        "January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December"
]

oldmethod = "false"

function parseDate(inputd) {
	const match = inputd.trim().match(/^(\d{1,2}|r|rr)[\/.,\s](\d{1,2}|r|rr)[\/.,\s](\d{2,4}|r|rrrr)$/i);
	if (!match) return null;
        let [_, dd, mm, yyyy] = match;
        if (((yyyy.toString()).split("")).length == 2) {
                ytwice = true;
                yyyy = parseInt("20" + yyyy.toString());
        }

        const today = new Date();
        const currentYear = today.getFullYear();
        const minYear = 2002;

        function clamp(num, min, max) {
                return Math.max(min, Math.min(num, max));
        }

        if (/^r$/i.test(yyyy) || /^rrrr$/i.test(yyyy)) {
                yyyy = Math.floor(Math.random() * (currentYear - minYear + 1)) + minYear;
        } else {
                yyyy = parseInt(yyyy);
                if (yyyy < 100) {
                        yyyy += yyyy < 50 ? 2000 : 1900;
                }
                //yyyy = clamp(yyyy, minYear, currentYear);
        }
        if (/^r$/i.test(mm) || /^rr$/i.test(mm)) {
                mm = Math.floor(Math.random() * 12) + 1;
        } else {
                mm = parseInt(mm);
	        if (mm < 1) {
               		mm = 1;
        	} else if (mm > 12) {
               		mm = 12;
        	}
                if (mm < 1 || mm > 12) return null;
        }

        const daysInMonth = new Date(yyyy, mm, 0).getDate();

        if (/^r$/i.test(dd) || /^rr$/i.test(dd)) {
                dd = Math.floor(Math.random() * daysInMonth) + 1;
        } else {
                dd = parseInt(dd);
        	if (dd < 1) {
          		dd = 1;
        	} else if (dd > 31) {
          		dd = daysInMonth;
        	}
                if (dd < 1 || dd > daysInMonth) return null;
        }

        const inputDate = new Date(yyyy, mm - 1, dd);
        if (
                inputDate.getFullYear() !== yyyy ||
                inputDate.getMonth() !== mm - 1 ||
                inputDate.getDate() !== dd
        ) {
                return null;
        }

        const rtoday2 = new Date();
        const today2 = new Date(rtoday2);
        today2.setDate(rtoday2.getDate() - 1)
        const minDate = new Date(2002, 0, 1);

        if (inputDate > today2) {
                dd = today.getDate()-1;
                mm = today.getMonth() + 1;
                yyyy = today.getFullYear();
                alert(`Last avaliable date is ${today2.getUTCDate()} ${months[today2.getUTCMonth()]}, ${today2.getUTCFullYear()}.`);
        }

        if (inputDate < minDate) {
                inputDate.setFullYear(2002, 0, 1);
                dd = 1
                mm = 1
                yyyy = 2002
                alert("First avalible date is January 1, 2002.");
        }

	checkedvalue = false;
	if (document.getElementById("oldlinks").checked) { 
       		checkedvalue = true
	} else {
		checkedvalue = false
	}

	formatted = dd + "/" + mm + "/" + yyyy
	document.getElementById("date-input").value = formatted
        return {
                day: dd,
                month: mm,
                year: yyyy,
                check: checkedvalue
        };
}

function simpleparseDate(inputd) {
	const match = inputd.trim().match(/^(\d{1,2}|r|rr)[\/.,\s](\d{1,2}|r|rr)[\/.,\s](\d{2,4}|r|rrrr)$/i);
	if (!match) return null;
        let [_, dd, mm, yyyy] = match;
        if (((yyyy.toString()).split("")).length == 2) {
                ytwice = true;
                yyyy = parseInt("20" + yyyy.toString());
        }

        const today = new Date();
        const currentYear = today.getFullYear();
        const minYear = 2002;

        function clamp(num, min, max) {
                return Math.max(min, Math.min(num, max));
        }

        if (/^r$/i.test(yyyy) || /^rrrr$/i.test(yyyy)) {
                yyyy = Math.floor(Math.random() * (currentYear - minYear + 1)) + minYear;
        } else {
                yyyy = parseInt(yyyy);
                if (yyyy < 100) {
                        yyyy += yyyy < 50 ? 2000 : 1900;
                }
        }
        if (/^r$/i.test(mm) || /^rr$/i.test(mm)) {
                mm = Math.floor(Math.random() * 12) + 1;
        } else {
                mm = parseInt(mm);
	        if (mm < 1) {
               		mm = 1;
        	} else if (mm > 12) {
               		mm = 12;
        	}
                if (mm < 1 || mm > 12) return null;
        }

        const daysInMonth = new Date(yyyy, mm, 0).getDate();

        if (/^r$/i.test(dd) || /^rr$/i.test(dd)) {
                dd = Math.floor(Math.random() * daysInMonth) + 1;
        } else {
                dd = parseInt(dd);
        	if (dd < 1) {
          		dd = 1;
        	} else if (dd > 31) {
          		dd = daysInMonth;
        	}
                if (dd < 1 || dd > daysInMonth) return null;
        }

        const inputDate = new Date(yyyy, mm - 1, dd);
        if (
                inputDate.getFullYear() !== yyyy ||
                inputDate.getMonth() !== mm - 1 ||
                inputDate.getDate() !== dd
        ) {
                return null;
        }

        const rtoday2 = new Date();
        const today2 = new Date(rtoday2);
        today2.setDate(rtoday2.getDate() - 1)
        const minDate = new Date(2002, 0, 1);

        if (inputDate > today2) {
                dd = today.getDate()-1;
                mm = today.getMonth() + 1;
                yyyy = today.getFullYear();
        }

        if (inputDate < minDate) {
                inputDate.setFullYear(2002, 0, 1);
                dd = 1
                mm = 1
                yyyy = 2002
        }

	checkedvalue = false;
	if (document.getElementById("oldlinks").checked) { 
       		checkedvalue = true
	} else {
		checkedvalue = false
	}

        return {
                day: dd,
                month: mm,
                year: yyyy,
                check: checkedvalue
        };
}

newstext = " ";
dyktext = " ";
let controller;
async function loadNews(dateStr) {
        const parsed = dateStr
        //const parsed = parseDate(dateStr);
        const errorEl = document.getElementById("error-message");
        errorEl.textContent = "";

        if (!parsed) {
                errorEl.textContent = "Invalid format, input as in DD/MM/YYYY.";
                return;
        }

	controller = new AbortController();
	const signal = controller.signal;

        const {
                day,
                month,
                year,
                check
        } = parsed;

        document.getElementById("news-box").textContent = "Loading news... please wait";
        document.getElementById("Xnews").removeEventListener("click", Xnewsfunc)
	document.getElementById("Xnews").value = "[#]";
	document.getElementById("Xnews").title = "Loading...";

        try {
                const res = await fetch(`/api/newsdata?day=${day}&month=${month}&year=${year}&check=${check}`, {signal});
                const data = await res.json();

                if (data.error) throw new Error(data.error);

                const dateLabel = `${day} ${data.month} ${year}`;
		if (data.news_html == "" || data.error != null) {
			newstext = `<i>Sorry, no news available for ${dateLabel}. This data may not exist for some early dates.</i>`;
                        
		} else {
			newstext = data.news_html;
		}
                document.getElementById("news-box").innerHTML = newstext;
                document.getElementById("Xnews").addEventListener("click", Xnewsfunc);
		document.getElementById("Xnews").value = "[X]";
		document.getElementById("Xnews").setAttribute("title", "Collapse/Expand");
		
        } catch (err) {
		if (err instanceof DOMException) {
		} else {
                	document.getElementById("news-box").innerHTML = "<i>Sorry, news failed to load.</i>";
                	errorEl.textContent = err.message;
                	console.error(err);
					console.log(res);
		}
        }
}

let controller2;
async function loadFacts(dateStr) {
        const parsed = dateStr;
        //const parsed = simpleparseDate(dateStr);
        const errorEl = document.getElementById("error-message");
        errorEl.textContent = "";

        if (!parsed) {
                errorEl.textContent = "Invalid format, input as in DD/MM/YYYY.";
                return;
        }

	controller2 = new AbortController();
	const signal = controller2.signal;

        const {
                day,
                month,
                year,
                check
        } = parsed;

        document.getElementById("fact-box").textContent = "Loading facts... please wait";
        document.getElementById("Xdyk").removeEventListener("click", Xdykfunc)
	document.getElementById("Xdyk").value = "[#]";
	document.getElementById("Xdyk").setAttribute("title", "Loading...");

        try {
                const res = await fetch(`/api/factsdata?day=${day}&month=${month}&year=${year}&check=${check}`, {signal});
                const data = await res.json();

                if (data.error) throw new Error(data.error);

                const dateLabel = `${day} ${data.month} ${year}`;

                document.getElementById("fact-box").innerHTML = data.dyk_html;
		if (data.dyk_html == "" || data.error != null) {
			dyktext = `<i>Sorry, no facts available for ${dateLabel}. This data is not provided for dates before February of 2004, and some days may be missing.</i>`;
                        
		} else {
			dyktext = data.dyk_html;
		}
                document.getElementById("fact-box").innerHTML = dyktext;
                document.getElementById("Xdyk").addEventListener("click", Xdykfunc);
		document.getElementById("Xdyk").value = "[X]";
		document.getElementById("Xdyk").setAttribute("title", "Collapse/Expand");
		
        } catch (err) {
		if (err instanceof DOMException) {
		} else {
                	document.getElementById("fact-box").innerHTML = "<i>Sorry, facts failed to load.</i>";
                	errorEl.textContent = err.message;
                	console.error(err);
			        console.log(res);
		}
        }
}

let controller3;
async function loadStats(dateStr) {
        const parsed = dateStr;//simpleparseDate(dateStr);
        const errorEl = document.getElementById("error-message");
        errorEl.textContent = "";

        if (!parsed) {
                errorEl.textContent = "Invalid format, input as in DD/MM/YYYY.";
                return;
        }

	controller3 = new AbortController();
	const signal = controller3.signal;

        const {
                day,
                month,
                year,
                check
        } = parsed;
        document.getElementById("stat-box").textContent = "Loading stats... please wait";
        document.getElementById("Xstat").removeEventListener("click", Xstatfunc)
	document.getElementById("Xstat").value = "[#]";
	document.getElementById("Xstat").setAttribute("title", "Loading...");

        try {
                const res = await fetch(`/api/statsdata?day=${day}&month=${month}&year=${year}&check=${check}`, {signal});
                const data = await res.json();
                if (data.error) throw new Error(data.error);

                const dateLabel = `${day} ${data.month} ${year}`;

                document.getElementById("stat-box").innerHTML = data.stat_html; document.getElementById("Xstat").addEventListener("click", Xstatfunc) ||
`<i>Sorry, no stats available for ${dateLabel}. This data is not provided for dates before 1 Jully of 2015.</i>`;
		document.getElementById("Xstat").value = "[X]";
		
        } catch (err) {
		if (err instanceof DOMException) {
		} else if (err instanceof SyntaxError) {
                        stattext = `<i>Sorry, no stats available for this date. This data is not provided for dates before 1 July of 2015.</i>`;
                	document.getElementById("stat-box").innerHTML = stattext;
	                document.getElementById("Xstat").value = "[X]";
			document.getElementById("Xstat").setAttribute("title", "Collapse/Expand");
			document.getElementById("Xstat").addEventListener("click", Xstatfunc)
		} else {
                	document.getElementById("stat-box").innerHTML = "<i>Sorry, stats failed to load.</i>";
                        document.getElementById("Xstat").addEventListener("click", Xstatfunc)
                	errorEl.textContent = err.message;
                	console.error(err);
			        console.log(res);
		}
        }
}

function search() {
        let inputd = document.getElementById("date-input").value;
	if (inputd == "") {
		return null;
	} else {
		if (controller) {
			try {
				controller.abort();
			} catch(e) {
				print(e);
			}
		} if (controller2) {
			try {
				controller2.abort();
			} catch(e) {
				print(e);
			}
		} if (controller3) {
			try {
				controller3.abort();
			} catch(e) {
				print(e);
			}			
		}
                inputd = parseDate(inputd)
		loadNews(inputd);
                console.log(inputd)
                loadFacts(inputd);
		loadStats(inputd);
	}
}


document.getElementById("search-btn").addEventListener("click", search);

function Xnewsfunc() {
	if (document.getElementById("Xnews").value == "[X]") { 
       		document.getElementById("Xnews").value = "[+]";
		newstext2 = document.getElementById("news-box").innerHTML;
		document.getElementById("news-box").innerHTML = "";
	} else if (document.getElementById("Xnews").value == "[+]") {
		document.getElementById("Xnews").value = "[X]";
		document.getElementById("news-box").innerHTML = newstext2;
	}
}

document.getElementById("Xnews").addEventListener("click", Xnewsfunc);


document.getElementById("oldlinks").addEventListener("click", () => {
	if (document.getElementById("oldlinks").checked) { 
       		oldmethod = "true"
	} else {
		oldmethod = "false"
	}

});

function Xdykfunc() {
	if (document.getElementById("Xdyk").value == "[X]") { 
       		document.getElementById("Xdyk").value = "[+]";
		dyktext2 = document.getElementById("fact-box").innerHTML;
		document.getElementById("fact-box").innerHTML = "";
	} else if (document.getElementById("Xdyk").value == "[+]") {
		document.getElementById("Xdyk").value = "[X]";
		document.getElementById("fact-box").innerHTML = dyktext2;
	}
}

document.getElementById("Xdyk").addEventListener("click", Xdykfunc);

function Xstatfunc() {
	if (document.getElementById("Xstat").value == "[X]") { 
       		document.getElementById("Xstat").value = "[+]";
		stattext = document.getElementById("stat-box").innerHTML;
		document.getElementById("stat-box").innerHTML = "";
	} else if (document.getElementById("Xstat").value == "[+]") {
		document.getElementById("Xstat").value = "[X]";;
		document.getElementById("stat-box").innerHTML = stattext;
	}
}
document.getElementById("Xstat").addEventListener("click", Xstatfunc)