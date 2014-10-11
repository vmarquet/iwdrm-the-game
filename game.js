$(document).ready(function() {

	// we use Tumbler API: https://www.tumblr.com/docs/en/api/v2
	var api_key = "4k2NGQU1cJZ4d1ZqrvKR9mnpUUmubGPlyUEzDZfiL5loPeIOzv";

	// we first get the number of posts
	var number_of_posts;
	$.ajax({
		type: 'GET',
		url: 'http://api.tumblr.com/v2/blog/iwdrm.tumblr.com/info?api_key=' + api_key,
		data: { get_param: 'value' },
		dataType: 'jsonp',
		success: function (data) {
			number_of_posts = data.response.blog.posts;
			console.log("Number of posts: " + number_of_posts);
			// we get all the data for each post:
			var post_offset = 0;
			getNextPosts(post_offset);
		}
	});

	// then, we create an array which will contain, for each post:
	// - the link to the gif
	// - the citation
	// - the name of the movie
	var posts = [];
	// each post will be an object of the following class:
	function MoviePost (movie_title, url_gif, citation) {
		this.movie_title = movie_title;
		this.url_gif     = url_gif;
		this.citation    = citation;
		this.bad_post    = false;  // flag, in case the gif has been deleted / or another problem
	}

	// the function to fill the posts[] array with the data
	function getNextPosts(post_offset) {
		if (post_offset < number_of_posts) {
			$.ajax({
				type: 'GET',
				url: 'http://api.tumblr.com/v2/blog/iwdrm.tumblr.com/posts?api_key=' + api_key + '&offset=' + post_offset,
				data: { get_param: 'value' },
				dataType: 'jsonp',
				success: function (data) {
					for (i = 0; i <= 19; i++) {
						var n = post_offset + i;  // this is the number of the post (staring from 0)

						// we check if we reached the end of the posts array
						// (in case the total number of posts was not a multiple of 20)
						if (typeof data.response.posts[i] === "undefined") {
							break;
						}

						// we fill the array of posts with the data
						if (typeof data.response.posts[i].photos === "undefined") {
							console.log(n + " undefined");
						}
						else {
							console.log(n + " defined");
						}

						// $('#results').append('</br>' + data.response.posts[i].post_url + ' ' + data.response.posts[i].caption + ' ' + data.response.posts[i].photos[0].alt_sizes[0].url + '</br></br></br>');
						// console.log(data.response.posts[i].caption);
					}
					// we get the 20 next posts (the API only allows 20 posts at at time)
					getNextPosts(post_offset + 20);
					// NB: problem: this is very slow (it would be quicker to launch all AJAX in parallel)
					// but I must do this recursive way because else, if I launch the next AJAX requests
					// without waiting for the current request to have been recieved, the post_offset counter
					// will be incremented and will reach the max post number before the request are complete,
					// and for every request, it will think that the request was for the last 20 posts
					// (because post_offset will have reach it's maximum) 
				}
			});
		}
	}

	// some gifs have been deleted due to copyright infringement,
	// in order to detect them, we must store their ID here
	var posts_with_deleted_gif = [];  // TODO

});