# neighborhood-map
Project 5 for Udacity Front-end Nanodegree

This is a neighborhood map of the Downtown New York City area. The map is pre-populated with various important locations. There is a search bar with auto-complete from Google Places. Instead of using the search results from Google places, I chose to use Google Maps textSearch. I found this combination of using the Places auto-complete with the Maps textSearch gave me the best results. The search is run on both Google Maps and Sqoot, a third party api I use for local deals. I purposely chose to use a separate filter box to filter all results, as I liked the returned results better. 

### Need to improve
The current method used to filter through the markers seems heavy. I believe a better way to approach this would be to create and hold the markers in a knockout custom binding, however I could not get it to work correctly. 

## Installation
1. Download or clone the repository.
2. Unzip the repo if necessary.
3. Open index.html in your browser of choice.

## Tools Used
* [Knockout.js](http://knockoutjs.com/)
* [jQuery](http://jquery.com)
* [infobox.js](http://gist.github.com/wbotelhos/5695744)
* [normalize.css](http://necolas.github.io/normalize.css/)

## APIs
* [Google Maps](https://developers.google.com/maps/)
* [Sqoot](https://www.sqoot.com/)

