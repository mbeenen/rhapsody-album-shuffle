// ==UserScript==
/* Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php */
// @name           rhapsodyShuffleAlbum
// @namespace      mbeenen
// @description    Overrides the standard shuffle behavior of the rhapsody web player to shuffle albums.
//   Songs within an album will play in track order. Also eliminates the limit of 800 songs for the queue.
// ==/UserScript==
var actualCode = '(' + function() {
    // Wipe out the limit on queue length, it's silly
    window.queueLimit = undefined;

    // Override the shuffle function of the player
    var oldShuffle = window.Queue.shuffle;
    window.Queue.shuffle = function() {
        var albumsArray = [];
        var finalOrder = [];
        var currentAlbumId = -1;
        var albumsArrayIndex = -1;

        // bucket songs by their album
        for (var i = 0; i < this.items.length; i++) {
            if(this.items[i].track.albumID != currentAlbumId) {
                currentAlbumId = this.items[i].track.albumID;
                albumsArrayIndex++;
                albumsArray[albumsArrayIndex] = [];
            }
            albumsArray[albumsArrayIndex].push(this.items[i].displayIndex);
            this.items[i].playIndex = this.items.length - i;
        }

        // perform the shuffle
        for (i = albumsArray.length-1; i > 0; i--) {
            var randomnumber = Math.floor(Math.random()*(i));
            var tmp = albumsArray[i];
            albumsArray[i] = albumsArray[randomnumber];
            albumsArray[randomnumber] = tmp;
        }

        // Join the albums back together
        for (i = 0; i < albumsArray.length; i++) {
            finalOrder = finalOrder.concat(albumsArray[i]);
        }
        //console.log('final order is ' + finalOrder);

        if (this.selectedItem)
            this.selectedItem.playIndex = 0;

        for (i = 0; i < finalOrder.length; i++) {
            this.items[finalOrder[i]].playIndex = i;
        }
        // console.log(this.items);
        this.items.sort(this.sortByPlay);

        for (i = 0; i < this.items.length; i++) {
            this.items[i].playIndex = i;
            this.items[i].played = false;
        }
        //console.log(this.items);
    };
} + ')();';
var script = document.createElement('script');
script.textContent = actualCode;
(document.head||document.documentElement).appendChild(script);
script.parentNode.removeChild(script);
