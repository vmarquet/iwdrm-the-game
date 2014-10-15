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

	var resultsSeen = true;
	// when this flag is true, we display a new question
	// when it is false, we display the results

	var goodAnswer;    // a reference to the good answer of the current question
	var totalAnswers = 0;  // the number of questions answered
	var goodAnswers  = 0;  // the number of good answers

	$('.next').click(function() {
		// the player saw results, we go create a new question
		if (resultsSeen == true) {
			resultsSeen = false;
			totalAnswers++;

			var done = false;
			// infinite loop, in case we select a bad post, we must retry
			while (done == false) {
				// we get a random number
				var n = Math.floor((Math.random() * number_of_posts));

				// we check that this post is not bad, and if the AJAX request for it has completed
				if (isValidPost(n) == false)
					continue;

				// TODO: we should check that the gif of this post has not been deleted

				var answer1 = posts[n].movie_title;
				// we get three random answers
				var answer2; var answer3; var answer4;
				var j = 0;
				while (j < 3) {
					var m = Math.floor((Math.random() * number_of_posts));

					// we check that this post is not bad, and if the AJAX request for it has completed
					if (isValidPost(m) == false)
						continue;

					if (j == 0)
						answer2 = posts[m].movie_title;
					if (j == 1)
						answer3 = posts[m].movie_title;
					if (j == 2)
						answer4 = posts[m].movie_title;
					j++;
				}

				goodAnswer = answer1;  // TODO: for now, good answer is always answer 1 ...

				// we can suppose that we have a post with all the data (gif, movie title, citation)
				$('#question').html(
					'<div id="question"> \
						<div id="post" style="text-align: center; border-top: 1px solid #aaa; width: 300px;"> \
							<img align="center" src="' + posts[n].url_gif + '"> \
							<a>' + posts[n].citation + '</a> \
						</div> \
					</div></br>');
				$('#answers').html(
					'<div id="answers"> \
						<form action=""> \
							<input type="radio" name="answer" value="' + answer1 + '">' + answer1 + '<br> \
							<input type="radio" name="answer" value="' + answer2 + '">' + answer2 + '<br> \
							<input type="radio" name="answer" value="' + answer3 + '">' + answer3 + '<br> \
							<input type="radio" name="answer" value="' + answer4 + '">' + answer4 + ' \
						</form> \
					</div><br>');
				$("#button").prop('value', 'Validate answer');

				done = true;
			}
		}
		// else, if the player just answered, we display the result
		else {
			resultsSeen = true;

			var colorTag;
			var buttonChecked = $('input[type="radio"][name="answer"]:checked').val();
			if (typeof buttonChecked === "undefined") {
				resultsSeen = false;
				return;
			}

			if (buttonChecked.localeCompare(goodAnswer) == 0) {
				colorTag = '<font color="green">';
				goodAnswers++;
			}
			else {
				colorTag = '<font color="red">';
			}

			$('#answers').html('<div id="answers">'
				+ colorTag + 'The good answer was: ' + goodAnswer + '</font></br></br>'
				+ 'Ratio of good answers: ' + (goodAnswers/totalAnswers*100).toFixed(0) + " %" +
				'</div><br>');
			$("#button").prop('value', 'Next question');

		}

	});

	// to check if the post is valid
	// (sometimes, the gif have been removed due to copyright infringement, or there are others problems)
	// also, the AJAX request for it can have not been completed
	function isValidPost(n) {
		if (typeof posts[n] === "undefined") {
			return false;
		}
		if (posts[n].bad_post == true) {
			return false;
		}
		return true;
	}


});