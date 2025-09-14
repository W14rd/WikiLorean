from flask import Flask, render_template, jsonify, request, redirect, session, send_from_directory
from flask_cors import CORS
from flask import request
import requests
import random
from bs4 import BeautifulSoup, NavigableString
from bs4.element import Tag
import calendar
from urllib.parse import urlparse, unquote
import re
import os
from datetime import datetime
import uuid


app = Flask(__name__, template_folder='templates')
app.secret_key = os.environ.get(uuid.uuid4().hex, uuid.uuid4().hex)
CORS(app)

app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'default-secret-key-for-dev')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<js>')
def js_asset(js: str):
    return send_from_directory(os.path.join(app.root_path, 'templates'), js)

@app.route('/assets/<path:filename>')
def template_asset(filename: str):
    return send_from_directory(os.path.join(app.root_path, 'templates/assets'), filename)

HEADERS = {'User-Agent': 'WikiLorean, github.com/W14rd/WikiLorean, gavriuknazar@gmail.com'}

months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

def convert_to_wiki_timestamp():

    dd = int(request.args.get("day"))
    mm = int(request.args.get("month"))
    yyyy = int(request.args.get("year")) 

    try:
        date_obj = datetime(year=yyyy, month=int(mm), day=int(dd))
        return date_obj.strftime("%Y-%m-%dT00:00:00Z")
    except ValueError:
        return None

def fetch_oldid_from_url(wiki_url: str, iso_timestamp: str) -> int | None:
    wiki_url = "https://en.wikipedia.org/wiki/" + str(resolve_redirect(str(wiki_url)[30:]))
    try:
        parsed_url = urlparse(wiki_url)
        if "wikipedia.org" not in parsed_url.netloc:
            raise ValueError("Not a valid Wikipedia URL.")

        match = re.match(r"^/wiki/(.+)$", parsed_url.path)
        if not match:
            raise ValueError("URL path doesn't contain a valid article title.")

        title = unquote(match.group(1))
    except Exception as e:
        #print(f"[ERROR] Failed to extract title: {e}")
        return None

    base_url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "titles": title,
        "prop": "revisions",
        "rvstart": iso_timestamp,
        "rvlimit": 1,
	"rvdir": "newer",
        "rvprop": "ids|timestamp",
        "format": "json"
    }

    try:
        response = requests.get(base_url, headers=HEADERS, params=params)
        response.raise_for_status()
        data = response.json()
        page_data = next(iter(data["query"]["pages"].values()))
        return page_data["revisions"][0]["revid"]
    except Exception as e:
        #print(f"[ERROR] Failed to fetch oldid: {e}")
        return None

def resolve_redirect(title):
    url = "https://en.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "titles": title,
        "redirects": "",
        "format": "json"
    }

    response = requests.get(url, headers=HEADERS, params=params)
    response.raise_for_status()
    data = response.json()

    redirects = data.get("query", {}).get("redirects", [])
    if redirects:
        return redirects[0]["to"]
    else:
        return title

def rewrite_links(soup_fragment):
    try:
        linkday = int(request.args.get("day"))
        linkmonth = int(request.args.get("month"))
        linkyear = int(request.args.get("year"))
        wikitimestamp = str(linkday) + "/" + str(linkmonth) + "/" + str(linkyear)
    except:
        return jsonify({"error": "Invalid or missing date parameters"}), 400
    for tag in soup_fragment.descendants:
        if tag.name == "a" and tag.has_attr("href"):
            href = tag["href"]
            if href.startswith("/wiki/") or href.startswith("/w/"):
                fulllink = "https://en.wikipedia.org/wiki/" + str(href[6:])
                oldtime = fetch_oldid_from_url(fulllink, convert_to_wiki_timestamp())
                if (oldtime != None):
                    tag["href"] = "https://en.wikipedia.org/w/index.php?title=" + tag["href"][6:] + "&oldid=" + str(oldtime)
                else:
                    tag["href"] = "https://en.wikipedia.org/w/index.php?title=" + tag["href"][6:]
            tag["target"] = "_blank"
            tag["rel"] = "noopener noreferrer"

def plain_rewrite_links(soup_fragment):
    for tag in soup_fragment.descendants:
        if tag.name == "a" and tag.has_attr("href"):
            href = tag["href"]
            if href.startswith("/wiki/") or href.startswith("/w/"):
                tag["href"] = f"https://en.wikipedia.org{href}"
            tag["target"] = "_blank"
            tag["rel"] = "noopener noreferrer"

def is_external_link(href):
    parsed = urlparse(href)
    if not parsed.netloc:
        return False
    return "wikipedia.org" not in parsed.netloc


@app.route("/api/newsdata")
def newsdata():
    try:
        day = int(request.args.get("day"))
        month = int(request.args.get("month"))
        year = int(request.args.get("year"))
        check = request.args.get("check")
    except:
        return jsonify({"error": "Invalid or missing date parameters"}), 400
    month_index = month
    month_name = months[month_index - 1]

    news_url = f"https://en.wikipedia.org/wiki/Portal:Current_events/{year}_{month_name}_{day}"
    clean_news_html = ""
    news_error = None
    try:
        news_html = requests.get(news_url, headers=HEADERS).text
        news_soup = BeautifulSoup(news_html, "html.parser")
        news_content = news_soup.select_one("#mw-content-text")
        if not news_content:
            raise Exception("No content section found")

        for tag in news_content.select(".mw-editsection, .mw-watchlink, .plainlinks, .mw-empty-elt"):
            tag.decompose()

        news_items = news_content.find_all(["ul", "p", "h3", "h4"], recursive=True)
        references = []
        ref_map = {}
        ref_counter = 1
        clean_news_html = ""

        for item in news_items:
            if item.name == "ul" and item.find_parent("table"):
                continue
            if item.name == "ul" and item.find_parent("ul"):
                continue

            for a in item.find_all("a", href=True):
                href = a["href"]
                if is_external_link(href):
                    if href not in ref_map:
                        label = a.get_text(strip=True) or href
                        ref_map[href] = (ref_counter, label)
                        references.append((ref_counter, href, label))
                        ref_counter += 1

                    ref_id, label = ref_map[href]
                    sup_tag = news_soup.new_tag("sup")
                    a_tag = news_soup.new_tag("a", href=href, target="_blank", rel="noopener noreferrer")
                    a_tag.string = f"[{ref_id}]"
                    a_tag["title"] = label.replace("(", "").replace(")", "").strip()
                    sup_tag.append(a_tag)
                    a.insert_after(sup_tag)
                    a.decompose()

            if check=="true":
                rewrite_links(item)
            else:
                plain_rewrite_links(item)
            clean_news_html += str(item)
        if str(clean_news_html)!="":
            clean_news_html += "<p>(Source: <a href="f"https://en.wikipedia.org/wiki/Portal:Current_events/{year}_{month_name}_{day}"">" + f"Current events, {month_name} {day} of {year}" + "</a>)</p>"

    except Exception as e:
        clean_news_html = ""
        news_error = str(e)

    return jsonify({
        "news_html": clean_news_html,
        "day": day,
        "month": month_name,
        "year": year,
	"old_links": check,
        "news_url": news_url,
        "news_error": news_error
    })

@app.route("/api/factsdata")
def factsdata():
    try:
        day = int(request.args.get("day"))
        month = int(request.args.get("month"))
        year = int(request.args.get("year"))
        check = request.args.get("check")
    except:
        return jsonify({"error": "Invalid or missing date parameters"}), 400
    month_index = month
    month_name = months[month_index - 1]

    dyk_url = f"https://en.wikipedia.org/wiki/Wikipedia:Recent_additions/{year}/{month_name}"
    dyk_list_html = ""
    dyk_error = None
    try:
        dyk_html = requests.get(dyk_url, headers=HEADERS).text
        dyk_soup = BeautifulSoup(dyk_html, "html.parser")
        content = dyk_soup.select_one("#mw-content-text")

        if not content:
            raise Exception("Could not find #mw-content-text")

        target_id = f"{day}_{month_name}_{year}"

        dyk_section = None

        dyk_list_items = []
        n=0
        ullist = []
        for sibling in content.find_all("ul"):
            if isinstance(sibling, Tag):
                n+=1
                if str(sibling.text) != "vte":
                    try:
                        if (sibling.text).split(" ")[1] == str(day):
                            for li in content.find_all("ul")[n].find_all("li"):
                                if check=="true":
                                    rewrite_links(li)
                                else:
                                    plain_rewrite_links(li)
                                li = str(li).split(" ");
                                for word in li:
                                    if word in ["<i>(pictured)</i>", "<i>(pictured),</i>", "<i>(pictured)</i>,", "<i>(example", "pictured)</i>"]:
                                        li.remove(word)
                                li = BeautifulSoup(" ".join(li), "html.parser") 
                                dyk_list_items.append(f"{li}")
                    except IndexError:
                        print("Invalid link")
            elif isinstance(sibling, NavigableString):
                #print("continue")
                continue


        if not dyk_list_items:
            raise Exception(f"No DYK facts found under {target_id}")
    
        dyk_list_html = "<ul>" + "\n".join(dyk_list_items) + "</ul>" + "<p>(Source: <a href="f"https://en.wikipedia.org/wiki/Wikipedia:Recent_additions/{year}/{month_name}#{day}_{month_name}_{year}"">" + f"Recent additions, {month_name} of {year}" + "</a>)</p>"

    except Exception as e:
        dyk_list_html = ""
        dyk_error = str(e)

    return jsonify({
        "dyk_html": dyk_list_html,
        "day": day,
        "month": month_name,
        "year": year,
	"old_links": check,
        "dyk_url": dyk_url + f"#{day}_{month_name}_{year}",
        "dyk_error": dyk_error
    })

@app.route("/api/statsdata")
def statsdata():
    clean_stats_html = ""
    stats_error = None
    day = int(request.args.get("day"))
    month = int(request.args.get("month"))
    month_index = month
    month_name = months[month_index - 1]
    year = int(request.args.get("year"))
    html = [
        "<table>",
        "<thead><tr><th>Rank</th><th>Article</th><th>Views</th></tr></thead>",
        "<tbody>"
    ]

    try:
        url = (
            f"https://wikimedia.org/api/rest_v1/metrics/"
            f"pageviews/top/en.wikipedia.org/all-access/"
            f"{year:04d}/{month:02d}/{day:02d}"
        )

        r = requests.get(url, headers=HEADERS)
        data = r.json()

        articles = data.get("items", [{}])[0].get("articles", [])
        cleaned_articles = []
        removed_articles = []
        for article in articles:
            title = article.get("article", "")
            if (
                title.startswith("Special:") or
                title.startswith("Wikipedia:") or
                title.startswith("Portal:") or
                title.startswith("Main_Page") or
                title.startswith("404.php") or
                title.startswith("Special%")
            ):
                continue
            check = request.args.get("check")
            cleaned_articles.append(article)
            if len(cleaned_articles) == 100:
                break

        if not cleaned_articles:
            return "<p>No top-views data available for that date.</p>"

    


        for idx, entry in enumerate(cleaned_articles):
            title = entry["article"]
            fixedtitle = entry["article"].replace("_", " ")
            entry["article"] = fixedtitle
            if check == "true":
                fulllink = "https://en.wikipedia.org/wiki/" + resolve_redirect(str(title))
                oldtime = fetch_oldid_from_url(fulllink, convert_to_wiki_timestamp())
                link = f"https://en.wikipedia.org/w/index.php?title={title}&oldid={oldtime}"
            else: 
                link = f"https://en.wikipedia.org/wiki/{title}"
            views = entry["views"]
            rank = idx + 1
            html.append(
                f"<tr><td>{rank}</td>"
                f"<td><a href='{link}' target='_blank'>{fixedtitle}</a></td>"
                f"<td>{views:,}</td></tr>"
            )
        html.append("</tbody></table>")
        html.append("<p>(Source: Wikipedia REST API. For elaborate statistics, see <a href="f"https://pageviews.wmcloud.org/topviews/?project=en.wikipedia.org&platform=all-access&date={year}-{month:02d}-{month:02d}&excludes="">" + "wmcloud.org" + "</a>)</p>")

    except Exception as e:
        clean_stats_html = ""
        stats_error = str(e)

    return jsonify({
        "stat_html": "\n".join(html),
        "month": month_name,
        "error": stats_error
    })



#if __name__ == "__main__":
 #   app.run(port=5000)