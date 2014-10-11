$(document).ready(function() {

	// we create an array which will contain, for each post:
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
			while (post_offset < number_of_posts-1) {
				getNextPosts(post_offset);  // we get the 20 next posts
				post_offset += 20;          // the API only allows 20 posts at at time
			}
		}
	});

	

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
						var n = post_offset + i;  // this is the number of the post (starting from 0)

						// we check if we reached the end of the posts array
						// (in case the total number of posts was not a multiple of 20)
						if (typeof data.response.posts[i] === "undefined") {
							break;
						}

						// we fill the array of posts with the data:
						var movie_title;
						var citation;

						var url_gif;
						// problem: the data of some posts is organized differently from others
						// so we much check if fields are defined or not
						// oh my god this is ugly...
						if (typeof data.response.posts[i].photos === "undefined") {
							// special situation
							// TODO: get the data, it's all in HTML in data.response.posts[i].body
							
							// temporary solution: ignore the post
							posts[n] = new MoviePost(null, null, null);
							posts[n].bad_post = true;
							continue;
						}
						else {
							// normal situation
							url_gif = data.response.posts[i].photos[0].alt_sizes[0].url

							// data.response.posts[i].caption is like:
							// "<p><i>"If you shoot this man, you die next."</i></p>
							// <p><a href="http://..." target="_blank">Reservoir Dogs (1992)</a></p>"
							// so we need to parse it
							var split_tmp = data.response.posts[i].caption.split('>')[2];
							if (typeof split_tmp === "undefined") {
								posts[n] = new MoviePost(null, null, null);
								posts[n].bad_post = true;
								continue;
							}
							citation = split_tmp.split('<')[0];

							split_tmp = data.response.posts[i].caption.split('>')[6];
							if (typeof split_tmp === "undefined") {
								posts[n] = new MoviePost(null, null, null);
								posts[n].bad_post = true;
								continue;
							}
							movie_title = split_tmp.split('<')[0];

							// debug
							// console.log(citation);
							// console.log(movie_title + "\n\n");
						}

						// we finally add the MoviePost to the array
						posts[n] = new MoviePost(movie_title, url_gif, citation);
					}
				}
			});
		}
	}

	// some gifs have been deleted due to copyright infringement,
	// in order to detect them, we must store their ID here
	var posts_with_deleted_gif = [];  // TODO

});