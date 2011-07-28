/**
 *
 * Copyright (C) 2011 by Ragnis Armus
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 */

var TACO = TACO || {};

(function (TACO)
{
	var _is_initialized = false;

	/**
	 * JSONP callbacks
	 */
	TACO._jsonpc = {};

	/**
	 * Create a new thread instance
	 */
	TACO.createThread = function ()
	{
		_init();

		return new threadObject();
	};

	/**
	 * Initialize taco
	 */
	var _init = function ()
	{
		if (_is_initialized == true)
		{
			return;
		}

		_is_initialized = true;

		// in the future we can initialize stuff here
	};

	/**
	 * Thread object
	 */
	var threadObject = function ()
	{
		var self = this;

		/**
		 * Your post's url. It will be used to find
		 * your comment
		 */
		this.url = null;

		/**
		 * How many tweets to display per page
		 */
		this.tweets_per_page = 20;

		/**
		 * Current page number
		 * If there are no tweets loaded yet, this will be null
		 */
		this.current_page = null;

		/**
		 * Is there a next page to load?
		 */
		this.has_next_page = false;

		/**
		 * Is there a previous page to load?
		 */
		this.has_previous_page = false;

		/**
		 * Callback, that will be called each time,
		 * tweets are requested through getTweets method
		 */
		this.on_render = null;

		/**
		 * Open tweet popup.
		 * Params:
		 *  - reply_to: tweet id to reply to
		 *
		 * @param Object params
		 */
		this.tweet = function (params)
		{
			var params = params || {};
			var url = '';

			url = 'https://twitter.com/intent/tweet';
			url += '?text=' + encodeURIComponent('Your comment here.');
			url += '&url=' + encodeURIComponent(self.link);

			if (params.reply_to != undefined)
			{
				url += '&in_reply_to=' + params.reply_to;
			}

			window.open(url, 'taco', 'width=550px,height=420px');
		};

		/**
		 * Load tweets and call on_render callback.
		 * Params:
		 *  - page: number of the page to load
		 *
		 * @param Object params
		 */
		this.getTweets = function (params)
		{
			self.loadTweets({
				page: params.page || 1,
				callback: self.on_render
			});

			return true;
		};

		/**
		 * Load next page of tweets (if available) and call
		 * on_render callback.
		 * If there is nothing to load, return false.
		 */
		this.getNextPage = function ()
		{
			if (self.has_next_page !== true)
			{
				return false;
			}

			self.loadTweets({
				page: self.current_page + 1,
				callback: self.on_render
			});
		};

		/**
		 * Load previous page of tweets (if available) and call
		 * on_render callback.
		 * If there is nothing to load, return false.
		 */
		this.getPreviousPage = function ()
		{
			if (self.has_previous_page !== true)
			{
				return false;
			}

			self.loadTweets({
				page: self.current_page - 1,
				callback: self.on_render
			});
		};

		/**
		 * Load tweets.
		 * Params:
		 *  - page: number of the page to load
		 *  - callback: should have one argument, where data will be passed
		 *
		 * @param Object params
		 */
		this.loadTweets = function (params)
		{
			var cbid = 'cb' + Math.floor(Math.random() * 1000000000);

			TACO._jsonpc[cbid] = function (data)
			{
				self.current_page = data.page;
				self.has_next_page = (data.next_page != undefined) ? true : false;
				self.has_previous_page = (data.page == 1) ? false : true;

				if (typeof params.callback === 'function')
				{
					params.callback.call(null, data);
				}
			};

			var url = '';
			url = 'http://search.twitter.com/search.json';
			url += '?q=' + encodeURIComponent(self.link);
			url += '&rpp=' + self.tweets_per_page;
			url += '&page=' + (params.page || 1);
			url += '&callback=TACO._jsonpc.' + cbid;

			_loadRes('js', url);
		};
	};

	/**
	 * Load js and css resources
	 *
	 * @param string type of the resource. Can be either `js` or `css`
	 * @param string url of the resource
	 */
	var _loadRes = function (type, url)
	{
		var r = null;

		if (type == 'js')
		{
			r = document.createElement('script');
			r.setAttribute('type', 'application/javascript');
			r.setAttribute('src', url);
		}
		else if (type == 'css')
		{
			r = document.createElement('link');
			r.setAttribute('rel', 'stylesheet');
			r.setAttribute('type', 'text/css');
			r.setAttribute('href', url);
		}

		document.getElementsByTagName('head')[0].appendChild(r);
	};
})(TACO);

