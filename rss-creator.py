import requests
from bs4 import BeautifulSoup
from feedgen.feed import FeedGenerator
import datetime
from dateutil.tz import tzlocal

def scrape_and_create_rss(url, output_file):
    # Send a GET request to the URL
    response = requests.get(url)
    
    # Parse the HTML content
    soup = BeautifulSoup(response.content, 'html.parser')
    
    # Find all <a> tags with '/news/' in their href
    news_links = soup.find_all('a', href=lambda href: href and '/news/2024/06' in href)
    
    # Create a FeedGenerator object
    fg = FeedGenerator()
    fg.title('News Feed')
    fg.description('RSS feed of news articles')
    fg.link(href=url)
    
    # Add items to the feed
    for link in news_links:
        fe = fg.add_entry()
        fe.title(link.text)
        fe.link(href=link['href'])
        fe.published(datetime.datetime.now(tzlocal()))
    
    # Generate the RSS feed
    fg.rss_file(output_file)

# Example usage
url_to_scrape = 'https://letsrun.com'  # Replace with the URL you want to scrape
output_file = 'letsrun.xml'  # Name of the output RSS file

scrape_and_create_rss(url_to_scrape, output_file)
print(f"RSS feed has been created and saved as {output_file}")