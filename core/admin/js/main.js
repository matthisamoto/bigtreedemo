var stickyControls,stickyControlsTop,stickyControlsStuck = false;

$(document).ready(function() {

	BigTreeCustomControls();
	
	// !BigTree Quick Search
	$('nav.main form input[type="search"]').keyup(function(ev) {
		v = $(this).val();
		if (v && ev.keyCode != 9) { //no tabs!
			$("#quick_search_results").load("admin_root/ajax/quick-search-results/", { query: v }, function() {
				$("#quick_search_results").show();
			});
		} else {
			$("#quick_search_results").hide().html("");
		}
	}).focus(function() {
		$(this).addClass("focus");
	}).blur(function() {
		setTimeout("$('nav.main form input[type=\"search\"]').removeClass(\"focus\").val(\"\"); $(\"#quick_search_results\").fadeOut(200, function() { $(this).html(\"\"); });", 300);
	});
	$("nav.main .advanced_search").live("click",function() {
		$("#quick_search_results").parents().submit();
		return false;
	});
	
	// !BigTree Link Finder
	$("#link_finder").keyup(function() {
		q = $(this).val();
		if (q == "") {
			$("#link_finder_results").hide().html("");
		} else {
			$("#link_finder_results").load("admin_root/ajax/link-finder/", { query: q }, function() {
				$("#link_finder_results").show().children("a").click(function() { return false; });
			});
		}
	});
	
	// !BigTree Sticky Controls
	stickyControls = $(".sticky_controls");
	if (stickyControls.length) {
		stickyControlsTop = stickyControls.offset().top;
		
		if (window.scrollY >= stickyControlsTop && !stickyControlsStuck) {
			stickyControlsStuck = true;
			stickyControls.addClass("stuck");
		}
		
		$(window).scroll(function() {
			if (window.scrollY >= stickyControlsTop && !stickyControlsStuck) {
				stickyControlsStuck = true;
				stickyControls.addClass("stuck");
			}
			if (window.scrollY < stickyControlsTop && stickyControlsStuck) {
				stickyControlsStuck = false;
				stickyControls.removeClass("stuck");
			}
		});
	}
	
	// Stop the end of breadcrumbs
	$(".breadcrumb a").click(function() {
		if ($(this).attr("href") == "#") {
			return false;
		}
	});
	
	// Removeable Resources
	$(".remove_resource").live("click",function() {
		p = $(this).parent();
		if (p.hasClass("currently_file")) {
			p.remove();
		} else {
			p.hide().find("input, img").remove();
		}
		return false;
	});
	
	// Form Image Browser
	$(".form_image_browser").live("click",function() {
		options = eval('(' + $(this).attr("name") + ')');
		field = $(this).attr("href").substr(1);
		BigTreeFileManager.formOpen("image",field,options);
		return false;
	});
	
	// Growl Hooks
	$("#growl").on("click",".close",function() {
		$(this).parents("article").remove();

		return false;
	});
	
	// Property Block Hide/Show
	$("h3.properties").click(function() {
		if ($(this).find(".icon_small").hasClass("icon_small_caret_right")) {
			// Set a cookie to keep it open next time.
			$.cookie("bigtree_default_properties_open","1", { expires: 365, path: "/" });
		} else {
			$.cookie("bigtree_default_properties_open","0", { path: "/" });
		}
		$(this).find(".icon_small").toggleClass("icon_small_caret_right").toggleClass("icon_small_caret_down");
		$(".property_block").toggle().next().toggle();
		return false;
	});
	
	// Tooltips
	$(".has_tooltip").each(function() {
		width = BigTree.WindowWidth();
		offset = $(this).offset();
		if (offset.left > (width / 2)) {
			position = "left";
		} else {
			position = "right";
		}
		new BigTreeToolTip($(this),$(this).attr("data-tooltip"),position,false,true);
	});

	// Image views
	$(".image_list img").load(function() {
		w = $(this).width();
		h = $(this).height();
		if (w > h) {
			perc = 108 / w;
			h = perc * h;
			style = { margin: Math.floor((108 - h) / 2) + "px 0 0 0" };
		} else {
			style = { margin: "0px" };
		}
		
		$(this).css(style);
	});
});

function BigTreeCustomControls() {
	// Setup custom checkboxes
	$("input[type=checkbox]").each(function() {
		if (!$(this).hasClass("custom_control")) {
			this.customControl = new BigTreeCheckbox(this);
			$(this).addClass("custom_control");
		}
	});
	
	// Setup custom select boxes
	$("select").each(function() {
		if (!$(this).hasClass("custom_control")) {
			this.customControl = new BigTreeSelect(this);
			$(this).addClass("custom_control");
		}
	});
	
	// Setup custom file boxes.
	$("input[type=file]").each(function() {
		if (!$(this).hasClass("custom_control")) {
			this.customControl = new BigTreeFileInput(this);
			$(this).addClass("custom_control");
		}
	});

	// Setup custom radio buttons.
	$("input[type=radio]").each(function() {
		if (!$(this).hasClass("custom_control")) {
			this.customControl = new BigTreeRadioButton(this);
			$(this).addClass("custom_control");
		}
	});
}

// !BigTreeCheckbox Class
var BigTreeCheckbox = Class.extend({

	Element: false,
	Link: false,

	init: function(element,text) {
		this.Element = $(element);
		
		label = this.Element.next("label");
		div = $("<div>").addClass("checkbox");
		a = $("<a>").attr("href","#checkbox");
		a.click($.proxy(this.click,this));
		label.click($.proxy(this.click,this));
		a.focus($.proxy(this.focus,this));
		a.blur($.proxy(this.blur,this));
		a.keydown($.proxy(this.keydown,this));
		
		if (element.checked) {
			a.addClass("checked");
		}
		
		if (element.disabled) {
			a.addClass("disabled");
		}
		
		if (element.tabIndex) {
			a.attr("tabindex",element.tabIndex);
		}
		
		this.Link = a;
		
		div.append(a);
		$(element).hide().after(div);
	},
	
	focus: function() {
		this.Link.addClass("focused");
	},
	
	blur: function() {
		this.Link.removeClass("focused");
	},
	
	keydown: function(event) {
		if (event.keyCode == 32) {
			$.proxy(this.click,this)();
			return false;
		}
	},

	click: function() {
		if (!this.Element.attr("disabled")) {
			if (this.Link.hasClass("checked")) {
				this.Link.removeClass("checked");
			} else {
				this.Link.addClass("checked");
			}
			this.Element.trigger("click");
		}
		return false;
	}
});

// !BigTreeSelect Class
var BigTreeSelect = Class.extend({

	Element: false,
	Container: false,
	Open: false,
	Options: [],
	BoundWindowClick: false,
	BoundOverflowScroll: false,
	WasRelative: false,
	KeyDownBind: false,
	
	init: function(element) {
		this.Element = $(element);
		
		$(element).css({ position: "absolute", left: "-1000000px" });
		div = $("<div>").addClass("select");
		tester = $("<div>").css({ position: "absolute", top: "-1000px", left: "-1000px", "font-size": "11px", "font-family": "Helvetica", "white-space": "nowrap" });
		$("body").append(tester);
		maxwidth = 0;
		
		html = "";
		selected = "";
		selected_option = "";
		
		// Need to find all children since we have to account for options in and out of optgroups
		first_level = $(element).children();
		y = 0;
		for (i = 0; i < first_level.length; i++) {
			el = first_level.get(i);
			if (el.nodeName.toLowerCase() == "optgroup") {
				l = $(el).attr("label");
				html += '<div class="group">' + l + '</div>';
				// Get the size of this text.
				tester.html(l);
				width = tester.width();
				if (width > maxwidth) {
					maxwidth = width;
				}
				
				options = $(el).find("option");
				for (x = 0; x < options.length; x++) {
					y++;
					option = options.eq(x);
					text = option.html();
					val = option.attr("value");
					if (!val) {
						val = text;
					}
					
					// Get the size of this text.
					tester.html(text);
					width = tester.width();
					if (width + 20 > maxwidth) {
						maxwidth = width + 20;
					}
					
					if (y == 1) {
						selected_option = text;
					}
					
					if (option.attr("selected")) {
						html += '<a class="optgroup active" href="#" data-value="' + val + '">' + text + '</a>';		
						selected_option = text;
					} else {
						html += '<a class="optgroup" href="#" data-value="' + val + '">' + text + '</a>';
					}
				}
			} else {
				y++;
				option = $(el);
				text = option.html();
				val = option.attr("value");
				if (!val) {
					val = text;
				}
				
				// Get the size of this text.
				tester.html(text);
				width = tester.width();
				if (width > maxwidth) {
					maxwidth = width;
				}
				
				if (y == 1) {
					selected_option = text;
				}
				
				
				if (option.attr("selected")) {
					html += '<a class="active" href="#" data-value="' + val + '">' + text + '</a>';		
					selected_option = text;
				} else {
					html += '<a href="#" data-value="' + val + '">' + text + '</a>';
				}
			}
		}
		
		div.html('<div class="handle"></div><span>' + selected_option + '</span><div class="select_options" style="display: none;">' + html + '</div>');

		spanwidth = maxwidth;
		// If we're in a section cell we may need to be smaller.
		if ($(element).parent().get(0).tagName.toLowerCase() == "section") {
			sectionwidth = $(element).parent().width();
			if (sectionwidth < (maxwidth + 56)) {
				spanwidth = sectionwidth - 80;
				div.find("span").css({ overflow: "hidden", padding: "0 0 0 10px" });
			}
		}
		
		div.find("span").css({ width: spanwidth + "px", height: "30px" }).html(selected_option).click($.proxy(this.click,this));
		div.find(".select_options").css({ width: (maxwidth + 54) + "px" });
		div.find("a").click($.proxy(this.select,this));
		div.find(".handle").click($.proxy(this.click,this));
		
		$(element).after(div);
		
		this.Container = div;

		// See if this select is disabled
		if (this.Element.attr("disabled")) {
			this.Container.addClass("disabled");
		}
		
		// Observe focus on the select that's been hidden.
		this.Element.focus($.proxy(this.focus,this));
		this.Element.blur($.proxy(this.blur,this));
		// Custom event to force open lists closed when another select opens.
		this.Element.on("closeNow",$.proxy(this.close,this));
	},

	add: function(value,text) {
		// Add to the actual select.
		op = new Option(text,value);
		this.Element.options[this.Element.options.length] = op;
		// Add to the styled select.
		a = $('<a href="#">' + text + '</a>');
		a.attr("data-value",value);
		this.Container.find(".select_options").append(a);
	},
	
	blur: function() {
		this.Container.removeClass("focused");
		this.Element.unbind("keydown");
	},

	click: function() {
		if (!this.Open) {
			$("select").not(this.Element).trigger("closeNow");
			this.Element.focus();
			
			// Check if we're in a sortable row and disable it's relative position if so.
			li = this.Element.parent("li");
			if (li.length) {
				if (li.css("position") == "relative") {
					li.css("position","");
					this.WasRelative = true;
				}
			}
			
			dList = this.Container.find(".select_options");
			this.Open = true;
			dList.show();
			this.Container.addClass("open");
			this.BoundWindowClick = $.proxy(this.close,this);
			$("body").click(this.BoundWindowClick);
			
			// Find out if we're in a dialog and have an overflow
			overflow = this.Container.parents(".overflow");
			if (overflow.length) {				
				// WebKit needs fixin.
				if ($.browser.webkit) {
					dList.css("marginTop",-1 * overflow.scrollTop() + "px");
				}
				
				// When someone scrolls the overflow, close the select or the dropdown will detach.
				this.BoundOverflowScroll = $.proxy(this.close,this);
				setTimeout($.proxy(function() { overflow.scroll(this.BoundOverflowScroll); },this),500);
			} else {
				// If the select drops below the visible area, scroll down a bit.
				dOffset = dList.offset().top + dList.height();
				toScroll = dOffset - window.scrollY - $(window).height();
				if (toScroll > 0) {
					$('html, body').animate({ scrollTop: window.scrollY + toScroll + 5 }, 200);
				}
			}
		} else {
			this.close();
		}

		return false;
	},
	
	close: function() {
		this.Open = false;
		this.Container.removeClass("open");
		this.Container.find(".select_options").hide();
		$("body").unbind("click",this.BoundWindowClick);
		
		if (this.BoundOverflowScroll) {
			this.Container.parents(".overflow").unbind("scroll",this.BoundOverflowScroll);
			this.BoundOverflowScroll = false;
		}
		
		// Reset relative position if applicable
		if (this.WasRelative) {
			this.Element.parent("li").css("position", "relative");
			this.WasRelative = false;
		}
		
		return false;
	},

	disable: function() {
		this.Element.attr("disabled","disabled");
		this.Container.addClass("disabled");
	},

	enable: function() {
		this.Element.attr("disabled","");
		this.Container.removeClass("disabled");
	},

	focus: function() {
		this.Container.addClass("focused");
		this.KeyBindDown = $.proxy(this.keydown,this);
		this.Element.keydown(this.KeyBindDown);
	},	
	
	keydown: function(ev) {
		// The original select element that's hidden off screen.
		el = this.Element.get(0);
		
		// If a modifier has been pressed, ignore this.
		if (ev.ctrlKey || ev.altKey || ev.metaKey) {
			return true;
		}
		
		// Get the original index and save it so we know when it changes.
		index = el.selectedIndex;
		oindex = index;
		
		// Up arrow pressed
		if (ev.keyCode == 38) {
			index--;
			if (index < 0) {
				index = 0;
			}
		// Down arrow pressed
		} else if (ev.keyCode == 40) {
			index++;
			if (index == el.options.length) {
				index--;
			}
		// A letter key was pressed
		} else if (ev.keyCode > 64 && ev.keyCode < 91) {
			spot = ev.keyCode - 65;
			letters = "abcdefghijklmnopqrstuvwxyz";
			letter = letters[spot];
			
			// Go through all the options in the select to see if any of them start with the letter that was pressed.
			for (i = index + 1; i < el.options.length; i++) {
				text = el.options[i].text;
				first_letter = text[0].toLowerCase();
				if (first_letter == letter) {
					index = i;
					break;
				}
			}
			
			// If we were already on that letter, find the next one with that same letter.
			if (index == oindex) {
				for (i = 0; i < oindex; i++) {
					text = el.options[i].text;
					first_letter = text[0].toLowerCase();
					if (first_letter == letter) {
						index = i;
						break;
					}
				}
			}
		}
		
		// We found a new element, fire an event saying the select changed and update the description in the styled dropdown.
		if (index != oindex) {
			// For some reason Firefox doesn't care that we stop the event and still changes the index of the hidden select area, so we're not going to update it if we're in Firefox.
			if (navigator.userAgent.indexOf("Firefox") == -1) {
				el.selectedIndex = index;
			}
			this.Container.find("span").html(el.options[index].text);
			this.Element.trigger("change", { value: el.options[index].value, text: el.options[index].text });
			return false;
		}
		
		// Stop the event if it's not a tab.
		if (ev.keyCode != 9) {
			return false;
		}
	},

	remove: function(value) {
		// Remove it from the actual select.
		ops = this.Element.find("option");
		for (i = 0; i < ops.length; i++) {
			if (ops.eq(i).val() == value) {
				ops.eq(i).remove();
			}
		}
		// Remove it from the styled one.
		as = this.Container.find(".select_options a");
		for (i = 0; i < as.length; i++) {
			if (as.eq(i).attr("data-value") == value) {
				text_was = as.eq(i).html();
				as.eq(i).remove();
			}
		}
		// If the current selected state is the value we're removing, switch to the first available.
		sel = this.Container.find("span").eq(0);
		if (sel.html() == text_was) {
			sel.html(this.Container.find(".select_options a").eq(0).html());
		}
	},
	
	select: function(event) {
		el = $(event.target);
		this.Element.val(el.attr("data-value"));
		this.Container.find("span").html(el.html());
		this.Container.find("a").removeClass("active");
		el.addClass("active");
		
		this.close();

		this.Element.trigger("change", { value: el.attr("data-value"), text: el.innerHTML });
		return false;
	}
});

// !BigTreeFileInput Class
var BigTreeFileInput = Class.extend({
	
	Container: false,
	Element: false,
	Timer: false,
	Top: 0,
	Left: 0,
	
	init: function(element) {
		this.Element = $(element);
		
		div = $("<div>").addClass("file_wrapper").html('<span class="handle">Upload</span><span class="data"></span>');
		this.Element.before(div);
		div.append(this.Element);
		div.mousemove($.proxy(this.watchMouse,this));
		
		this.Timer = setInterval($.proxy(this.checkInput,this),250);
		
		this.Container = div;
	},
	
	// Special thanks to http://www.shauninman.com/archive/2007/09/10/styling_file_inputs_with_css_and_the_dom
	watchMouse: function(e) {
		if (typeof e.pageY == 'undefined' &&  typeof e.clientX == 'number' && document.documentElement) {
			e.pageX = e.clientX + document.documentElement.scrollLeft;
			e.pageY = e.clientY + document.documentElement.scrollTop;
		};
		
		offset = this.Container.offset();
		this.Left = offset.left;
		this.Top = offset.top;
		
		if (e.pageX < this.Left || e.pageY < this.Top || e.pageX > (this.Left + 300) || e.pageY > (this.Top + 30)) {
			this.Element.hide();
			return;
		} else {
			this.Element.show();
		}

		var ox = oy = 0;
		var elem = this;
		if (elem.offsetParent) {
			ox = elem.offsetLeft;
			oy = elem.offsetTop;
			while (elem = elem.offsetParent) {
				ox += elem.offsetLeft;
				oy += elem.offsetTop;
			};
		};

		var x = e.pageX - ox;
		var y = e.pageY - oy;
		
		if (this.Element.parents(".bigtree_dialog_window").length) {
			x -= this.Element.parents(".bigtree_dialog_form").offset().left;
			y -= this.Element.parents(".bigtree_dialog_form").offset().top - 30;
		}
		
		var w = this.Element.get(0).offsetWidth;
		var h = this.Element.get(0).offsetHeight;

		this.Element.css({ top: (y - (h / 2)  + 'px'), left: (x - (w - 30) + 'px') });
	},
	
	showInput: function() {
		this.Element.show();
	},
	
	hideInput: function() {
		this.Element.hide();
	},
	
	checkInput: function() {
		pinfo = basename(this.Element.val());
		this.Container.find(".data").html(pinfo);
	},
	
	destroy: function() {
		clearInterval(this.Timer);
	},
	
	connect: function(el) {
		this.Element = $(el);
		this.Timer = setInterval($.proxy(this.checkInput,this),250);
		return this;
	}
});

// !BigTreeRadioButton Class
var BigTreeRadioButton = Class.extend({

	Element: false,
	Link: false,

	init: function(element,text) {
		this.Element = $(element);
		
		div = $("<div>").addClass("radio_button");
		a = $("<a>").attr("href","#radio");
		a.click($.proxy(this.click,this));
		a.focus($.proxy(this.focus,this));
		a.blur($.proxy(this.blur,this));
		a.keydown($.proxy(this.keydown,this));
		
		if (element.checked) {
			a.addClass("checked");
		}
		
		if (element.tabIndex) {
			a.attr("tabIndex",element.tabIndex);
		}
		
		this.Link = a;
		
		div.append(a);
		this.Element.hide();
		this.Element.after(div);
	},
	
	focus: function(ev) {
		this.Link.addClass("focused");
	},
	
	blur: function(ev) {
		this.Link.removeClass("focused");
	},
	
	keydown: function(ev) {
		if (ev.keyCode == 32) {
			this.click(ev);
			return false;
		}
		if (ev.keyCode == 39 || ev.keyCode == 40) {
			this.next(ev);
			return false;
		}
		if (ev.keyCode == 37 || ev.keyCode == 38) {
			this.previous(ev);
			return false;
		}
	},

	click: function(ev) {
		if (this.Link.hasClass("checked")) {
			// If it's already clicked, nothing happens for radio buttons.
		} else {
			this.Link.addClass("checked");
			this.Element.attr("checked",true);
			$('input[name="' + this.Element.attr("name") + '"]').each(function() {
				if (!this.checked) {
					this.customControl.Link.removeClass("checked");
				}
			});
		}
		this.Element.trigger("click");
		return false;
	},
	
	next: function(ev) {
		all = $('input[name="' + this.Element.attr("name") + '"]');
		index = all.index(this.Element);
		if (index != all.length - 1) {
			all[index + 1].customControl.Link.focus();
			all[index + 1].customControl.click(ev);
		}
	},
	
	previous: function(ev) {
		all = $('input[name="' + this.Element.attr("name") + '"]');
		index = all.index(this.Element);
		if (index != 0) {
			all[index - 1].customControl.Link.focus();
			all[index - 1].customControl.click(ev);
		}
	}
});

// !BigTree Photo Gallery Class
var BigTreePhotoGallery = Class.extend({
	container: false,
	counter: false,
	dragging: false,
	key: false,
	fileInput: false,
	activeCaption: false,
	
	init: function(container,key,counter) {
		this.key = key;
		this.container = $("#" + container);
		this.counter = counter;
		this.container.find(".add_photo").click($.proxy(this.addPhoto,this));
		this.fileInput = this.container.find("footer input");
		
		this.container.find("ul").sortable({ items: "li" });
		this.container.on("click",".icon_delete",this.deletePhoto);
		this.container.on("click",".icon_edit",$.proxy(this.editPhoto,this));
		this.container.find(".form_image_browser").click($.proxy(this.openFileManager,this));
	},
	
	addPhoto: function() {
		if (!this.fileInput.val()) {
			return false;
		}
		new BigTreeDialog("Image Caption",'<fieldset><label>Caption</label><input type="text" name="caption" /></fieldset>',$.proxy(this.saveNewFile,this),"caption");
		return false;
	},
	
	deletePhoto: function() {
		new BigTreeDialog("Delete Photo",'<p class="confirm">Are you sure you want to delete this photo?</p>',$.proxy(function() {
			$(this).parents("li").remove();
		},this),"delete",false,"OK");
		
		return false;
	},
	
	editPhoto: function(ev) {
		link = $(ev.target);
		this.activeCaption = link.siblings(".caption");
		new BigTreeDialog("Image Caption",'<fieldset><label>Caption</label><input type="text" name="caption" value="' + htmlspecialchars(this.activeCaption.val()) + '"/></fieldset>',$.proxy(this.saveCaption,this),"caption");
		return false;
	},
	
	saveCaption: function(data) {
		this.activeCaption.val(data.caption);
		this.activeCaption = false;
	},
	
	saveNewFile: function(data) {
		li = $('<li>').html('<figure><figcaption>Awaiting Uploading</figcaption></figure><a href="#" class="icon_edit"></a><a href="#" class="icon_delete"></a>');
		li.append(this.fileInput.hide());
		li.append($('<input type="hidden" name="' + this.key + '[' + this.counter + '][caption]" class="caption" />').val(data.caption));
		this.container.find("ul").append(li);

		this.counter++;
		c = this.counter;
		
		new_file = $('<input type="file" class="custom_control" name="' + this.key + '[' + this.counter + '][image]">').hide();
		this.container.find(".file_wrapper").append(new_file);
		customControl = this.fileInput.get(0).customControl;
		new_file.get(0).customControl = customControl.connect(new_file.get(0));
		this.fileInput.get(0).customControl = false;
		this.fileInput = new_file;
	},
	
	openFileManager: function(ev) {
		target = $(ev.target);
		// In case they click the span instead of the button.
		if (!target.attr("href")) {
			field = target.parent().attr("href").substr(1);	
			options = eval('(' + target.parent().attr("name") + ')');
		} else {
			field = target.attr("href").substr(1);
			options = eval('(' + target.attr("name") + ')');
		}
		BigTreeFileManager.formOpen("photo-gallery",field,options,$.proxy(this.useExistingFile,this));
		return false;
	},
	
	useExistingFile: function(path,caption,thumbnail) {
		li = $('<li>').html('<figure><img src="' + thumbnail + '" alt="" /></figure><a href="#" class="icon_edit"></a><a href="#" class="icon_delete"></a>');
		li.find("img").load(function() {
			w = $(this).width();
			h = $(this).height();
			if (w > h) {
				perc = 75 / w;
				h = perc * h;
				style = { margin: Math.floor((75 - h) / 2) + "px 0 0 0" };
			} else {
				perc = 75 / h;
				w = perc * w;
				style = { margin: "0 0 0 " + Math.floor((75 - w) / 2) + "px" };
			}
			
			$(this).css(style);
		});
		li.append($('<input type="hidden" name="' + this.key + '[' + this.counter + '][existing]" />').val(path));
		li.append($('<input type="hidden" name="' + this.key + '[' + this.counter + '][caption]" class="caption" />').val(caption));
		this.container.find("ul").append(li);

		this.counter++;
		c = this.counter;
	}
});

// !BigTree Tag Adder Object
var BigTreeTagAdder = {
	
	element: false,
	entry: false,
	module: false,
	searching: false,
	selected: -1,
	dropdown: false,
	lastsearch: false,
	
	init: function(module,entry,element) {
		this.element = $(element);
		this.entry = entry;
		this.module = module;
		// Setup delete hooks on existing tags
		$("#tag_list a").click(this.deleteHook);		

		$("#tag_entry").keydown($.proxy(this.checkKeys,this));
		$("#tag_entry").keyup($.proxy(this.searchTags,this));
	},
	
	checkKeys: function(ev) {
		if (ev.keyCode == 13) {
			if (this.selected > -1 && this.dropdown)
				$("#tag_entry").val($("#tag_results li").eq(this.selected).find("a").html().replace("<span>","").replace("</span>",""));
			this.addTag(ev);
			return false;
		}
		if (ev.keyCode == 38) {
			this.moveUp(ev);
			return false;
		}
		if (ev.keyCode == 40) {
			this.moveDown(ev);
			return false;
		}
	},
	
	moveUp: function(ev) {
		if (!this.dropdown || this.selected < 0)
			return;
		$("#tag_results li").eq(this.selected).removeClass("selected");
		this.selected--;
		if (this.selected > -1)
			$("#tag_results li").eq(this.selected).addClass("selected");
	},
	
	moveDown: function(ev){
		max = $("#tag_results li").length - 1;
		if (!this.dropdown || this.selected == max)
			return;
		if (this.selected > -1)
			$("#tag_results li").eq(this.selected).removeClass("selected");
		this.selected++;
		$("#tag_results li").eq(this.selected).addClass("selected");
	},
	
	searchTags: function(ev) {
		tag = $("#tag_entry").val();
		if (tag != BigTreeTagAdder.lastsearch) {
			BigTreeTagAdder.lastsearch = tag;
			if (tag.length > 3) {
				$("#tag_results").load("admin_root/ajax/tags/search/", { tag: tag }, BigTreeTagAdder.hookResults);
			} else {
				$("#tag_results").hide();
			}
		}
	},
	
	hookResults: function() {
		BigTreeTagAdder.selected = -1;
		ul = $("#tag_results");
		if (ul.html()) {
			ul.show();
			BigTreeTagAdder.dropdown = true;
			$("#tag_results li a").click(BigTreeTagAdder.chooseTag);
		} else {
			BigTreeTagAdder.dropdown = false;
			ul.hide();
		}
	},
	
	deleteHook: function(ev) {
		$(this).parents("li").remove();
		return false;
	},
	
	chooseTag: function(ev) {
		el = ev.target;
		tag = el.innerHTML.replace("<span>","").replace("</span>","");
		if (tag) {
			$.ajax("admin_root/ajax/tags/create-tag/", { type: "POST", data: { module: BigTreeTagAdder.module, entry: BigTreeTagAdder.entry, tag: tag }, success: BigTreeTagAdder.addedTag });
		}
		return false;
	},
	
	addTag: function(ev) {
		tag = $("#tag_entry").val();
		if (tag) {
			$.ajax("admin_root/ajax/tags/create-tag/", { type: "POST", data: { module: BigTreeTagAdder.module, entry: BigTreeTagAdder.entry, tag: tag }, success: BigTreeTagAdder.addedTag });
		}
	},
	
	addedTag: function(data) {
		id = data;
		li = $("<li>").addClass("tag").html('<a href="#"><input type="hidden" name="_tags[]" value="' + id + '" />' + tag + '<span>x</span></a>');
		li.children("a").click(BigTreeTagAdder.deleteHook);

		$("#tag_list").append(li);
		$("#tag_entry").val("").focus();
		$("#tag_results").hide();
		BigTreeTagAdder.dropdown = false;
	}
};

// !BigTree Dialog Class
var BigTreeDialog = Class.extend({

	dialogWindow: false,
	onComplete: false,
	onCancel: false,
	dialogWidth: false,
	dialogHeight: false,
	heightWatchTimer: false,

	init: function(title,content,oncomplete,icon,noSave,altSaveText,altOnComplete,altOnCancel) {
		$("body").on("keyup",$.proxy(this.CheckForEsc,this));
		this.onComplete = oncomplete;
		overlay = $('<div class="bigtree_dialog_overlay">');
		dialog_window = $('<div class="bigtree_dialog_window">');
		$("body").append(overlay).append(dialog_window);
		
		if (altSaveText) {
			saveText = altSaveText;
		} else {
			saveText = "Save";
		}
		
		if (!noSave) {
			if (icon) {
				dialog_window.html('<h2><span class="icon_dialog_' + icon + '"></span>' + title + '</h2><form class="bigtree_dialog_form" method="post" enctype="multipart/form-data" action="" class="module"><div class="overflow">' + content + '</div><footer><a class="button bigtree_dialog_close">Cancel</a><input type="submit" class="button blue" value="' + saveText + '" /></footer></form>');
			} else {
				dialog_window.html('<h2>' + title + '</h2><form class="bigtree_dialog_form" method="post" action="" class="module"><div class="overflow">' + content + '</div><footer><a class="button bigtree_dialog_close">Cancel</a><input type="submit" class="button blue" value="' + saveText + '" /></footer></form>');
			}
		} else {
			dialog_window.html('<h2><a href="#" class="icon_delete" class="bigtree_dialog_close"></a>' + title + '</h2><form class="bigtree_dialog_form" method="post" action="" class="module"><div class="overflow">' + content + '</div><br class="clear" /></form>');
		}		
		
		this.dialogWidth = dialog_window.width();
		this.dialogHeight = dialog_window.height();
		leftd = parseInt((BigTree.WindowWidth() - this.dialogWidth) / 2);
		topd = parseInt((BigTree.WindowHeight() - this.dialogHeight) / 2);

		dialog_window.css({ "top": topd + "px", "left": leftd + "px" });
		
		if (altOnCancel) {
			this.onCancel = altOnCancel;
			dialog_window.find(".bigtree_dialog_close").click(altOnCancel);		
		} else {
			dialog_window.find(".bigtree_dialog_close").click($.proxy(this.DialogClose,this));
		}
		
		if (altOnComplete) {
			dialog_window.find(".bigtree_dialog_form").submit(this.onComplete);
		} else {
			dialog_window.find(".bigtree_dialog_form").submit($.proxy(this.DialogSubmit,this));
		}
		
		dialog_window.find("input[type=submit]").focus();
		
		this.dialogWindow = dialog_window;
		
		// Move the dialog around with the window size.
		$(window).resize($.proxy(this.WindowResize,this));
		
		// Set a timer to watch for a change in the dialog height
		this.heightWatchTimer = setInterval($.proxy(this.WatchHeight,this),250);
	},
	
	CheckForEsc: function(e) {
		if (e.keyCode == 27) {
			if (this.onCancel) {
				this.onCancel();
				$("body").off("keyup");
			} else {
				this.DialogClose();
			}
		}
	},

	DialogClose: function() {
		$(".bigtree_dialog_overlay").last().remove();
		$(".bigtree_dialog_window").last().remove();
		$("body").off("keyup");
		$(window).off("resize");
		return false;
	},

	DialogSubmit: function(ev) {
		ev.preventDefault();
		ev.stopPropagation();
		// Let's move all the TinyMCE content back.
		if (typeof tinyMCE != "undefined") {
			this.dialogWindow.find("textarea:hidden").each(function() {
				id = $(this).attr("id");
				$(this).val(tinyMCE.get(id).getContent());
			});
		}
		this.onComplete(this.dialogWindow.find(".bigtree_dialog_form").serializeJSON());
		if (this.onCancel) {
			this.onCancel();
		} else {
			this.DialogClose();
		}
		return false;
	},
	
	WatchHeight: function() {
		height = this.dialogWindow.height();
		if (height != this.dialogHeight) {
			this.dialogHeight = height;
			this.WindowResize(false,true);
		}
	},
	
	WindowResize: function(ev,animate) {
		leftd = parseInt((BigTree.WindowWidth() - this.dialogWidth) / 2);
		topd = parseInt((BigTree.WindowHeight() - this.dialogHeight) / 2);
		
		if (animate) {
			this.dialogWindow.animate({ "top": topd + "px", "left": leftd + "px" }, 200);
		} else {
			this.dialogWindow.css({ "top": topd + "px", "left": leftd + "px" });
		}
	}
});


// !BigTreeFileManager
var BigTreeFileManager = {

	// Properties
	availableThumbs: false,
	browser: false,
	callback: false,
	currentFolder: 0,
	currentlyKey: false,
	currentlyName: false,
	fieldName: false,
	minHeight: false,
	minWidth: false,
	previewPrefix: false,
	startSearchTimer: false,
	titleSaveTimer: false,
	type: false,
	
	// Methods
	
	addFile: function() {
		new BigTreeDialog("Upload File",'<input type="hidden" name="folder" value="' + this.currentFolder + '" /><fieldset><label>Select A File</label><input type="file" name="file" /></fieldset>',$.proxy(this.createFile,this),"folder",false,"Upload File",true,this.cancelAdd);
		
		return false;
	},
	
	addFolder: function() {
		new BigTreeDialog("New Folder",'<input type="hidden" name="folder" value="' + this.currentFolder + '" /><fieldset><label>Folder Name</label><input type="text" name="name" /></fieldset>',$.proxy(this.createFolder,this),"folder",false,"Create Folder",true,this.cancelAdd);
		
		return false;
	},
	
	cancelAdd: function() {
		$(".bigtree_dialog_overlay").last().remove();
		$(".bigtree_dialog_window").last().remove();
		
		return false;
	},
	
	chooseImageSize: function() {
		$("#file_browser_upload").unbind("click").html("").css({ cursor: "default" }).click(function() { return false; });
		$("#file_browser_form .footer input.blue").hide();
		$("#file_browser_info_pane").css({ position: "absolute", marginLeft: "609px", height: "397px" });
		new_pane = $('<section id="file_browser_size_pane" style="margin-left: 820px;">');
		new_pane.html('<h3>Select Image Size</h3><p>Click on an image size below to insert into your content.</p>');
		for (i = 0; i< this.availableThumbs.length; i++) {
			size = this.availableThumbs[i];
			link = $('<a class="button">');
			link.attr("href",size.file.replace("{wwwroot}", "www_root/").replace("{staticroot}","static_root/"));
			link.html(size.name);
			new_pane.append(link);
		}
		link = $('<a class="button">');
		link.attr("href",$("#file_browser_selected_file").val().replace("{wwwroot}", "www_root/").replace("{staticroot}","static_root/"));
		link.html("Original");
		new_pane.append(link);
		$("#file_browser_form .footer").before(new_pane);
		new_pane.animate({ marginLeft: "210px" },500);
		$("#file_browser_info_pane").animate({ marginLeft: "-1px" },500);
		
		new_pane.find("a").click(function() {
			BigTreeFileManager.fieldName.value = $(this).attr("href");
			BigTreeFileManager.closeFileBrowser();
			return false;
		});
	},
	
	closeFileBrowser: function() {
		$(".bigtree_dialog_overlay").last().remove();
		$("#file_browser").remove();
		$("#mceModalBlocker").show();
		
		return false;
	},
	
	createFile: function() {
		$(".bigtree_dialog_overlay").last().remove();
		$("body").append($('<iframe name="file_manager_upload_frame" style="display: none;" id="file_manager_upload_frame">'));
		$(".bigtree_dialog_form").last().attr("action","admin_root/ajax/file-browser/upload/").attr("target","file_manager_upload_frame");
		$(".bigtree_dialog_form").last().find("footer *").hide();
		$(".bigtree_dialog_form").last().find("footer").append($('<p style="line-height: 16px; color: #333;"><img src="admin_root/images/spinner.gif" alt="" style="float: left; margin: 0 5px 0 0;" /> Uploading file. Please wait…</p>'));
	},
	
	createFolder: function(data) {
		$(".bigtree_dialog_overlay").last().remove();
		$("body").append($('<iframe name="file_manager_upload_frame" style="display: none;" id="file_manager_upload_frame">'));
		$(".bigtree_dialog_form").last().attr("action","admin_root/ajax/file-browser/create-folder/").attr("target","file_manager_upload_frame");
		$(".bigtree_dialog_form").last().find("footer *").hide();
		$(".bigtree_dialog_form").last().find("footer").append($('<p style="line-height: 16px; color: #333;"><img src="admin_root/images/spinner.gif" alt="" style="float: left; margin: 0 5px 0 0;" /> Creating folder. Please wait…</p>'));
	},
	
	disableCreate: function() {
		$("#file_browser .header a").hide();		
	},
	
	enableCreate: function() {
		$("#file_browser .header a").show();
	},
	
	fileBrowser: function() {
		$("#file_browser_type_icon").addClass("icon_folder");
		$("#file_browser_type .title").html("File Browser");
		this.openFileFolder(0);
	},
	
	fileBrowserPopulated: function() {
		$("#file_browser_contents a").click(this.fileClick);
	},
	
	fileClick: function() {
		// Show the "Use" button now that something is selected.
		$("#file_browser .footer .blue").show();
		
		if ($(this).hasClass("disabled")) {
			return false;
		}
		
		if ($(this).hasClass("folder")) {
			BigTreeFileManager.openFileFolder($(this).attr("href").substr(1));
			return false;
		}
		
		$("#file_browser_contents a").removeClass("selected");
		$(this).addClass("selected");
		$("#file_browser_selected_file").val($(this).attr("href").replace("{wwwroot}","www_root/").replace("{staticroot}","static_root/"));
		$("#file_browser_info_pane").html('<span class="spinner"></span>');
		$("#file_browser_info_pane").load("admin_root/ajax/file-browser/file-info/",
			{ file: $(this).attr("href") },
			function() {
				$("#file_browser_detail_title_input").keyup(function() {
					clearTimeout(BigTreeFileManager.titleSaveTimer);
					BigTreeFileManager.titleSaveTimer = setTimeout("BigTreeFileManager.saveFileTitle();",500);
				});				
			}
		);
		
		return false;
	},
	
	finishedUpload: function(file,type,width,height) {
		$(".bigtree_dialog_window").last().remove();
		$("#file_manager_upload_frame").remove();
		
		if (this.type == "image" || this.type == "photo-gallery") {
			this.openImageFolder(this.currentFolder);	
		} else {
			this.openFileFolder(this.currentFolder);
		}
	},
	
	formOpen: function(type,field_name,options,callback) {
		this.currentlyName = field_name;
		this.currentlyKey = options.currentlyKey;
		this.fieldName = false;
		this.previewPrefix = options.previewPrefix;
		this.callback = callback;
		this.open(type,options.minWidth,options.minHeight);
	},
	
	imageBrowser: function() {
		$("#file_browser_type_icon").addClass("icon_images");
		$("#file_browser_type .title").html("Image Library");
		this.openImageFolder(0);
	},
	
	imageBrowserPopulated: function() {
		$("#file_browser_contents a").click(this.imageClick);
	},
	
	imageClick: function() {
		// Show the "Use" button now that something is selected.
		$("#file_browser .footer .blue").show();
		
		if ($(this).hasClass("disabled")) {
			return false;
		}
		
		if ($(this).hasClass("folder")) {
			BigTreeFileManager.openImageFolder($(this).attr("href").substr(1));
			return false;
		}
		
		$("#file_browser_contents a").removeClass("selected");
		$(this).addClass("selected");
		
		data = eval('(' + $(this).attr("href") + ')');
		BigTreeFileManager.availableThumbs = data.thumbs;
		$("#file_browser_selected_file").val(data.file.replace("{wwwroot}","www_root/").replace("{staticroot}","static_root/"));
		
		$("#file_browser_info_pane").html('<span class="spinner"></span>');
		$("#file_browser_info_pane").load("admin_root/ajax/file-browser/file-info/",
			{ file: data.file },
			function() {
				$("#file_browser_detail_title_input").keyup(function() {
					clearTimeout(BigTreeFileManager.titleSaveTimer);
					BigTreeFileManager.titleSaveTimer = setTimeout("BigTreeFileManager.saveFileTitle();",500);
				});				
			}
		);
		
		return false;
	},
	
	open: function(type,min_width,min_height) {
		if ($.browser.msie  && parseInt($.browser.version, 10) === 7) {
			alert("This feature is not supported in Internet Explorer 7.  Please upgrade your browser.");
			return false;
		}

		this.type = type;
		this.minWidth = min_width;
		this.minHeight = min_height;
			
		// Figure out where to put the window.
		width = BigTree.WindowWidth();
		height = BigTree.WindowHeight();
		leftOffset = Math.round((width - 820) / 2);
		topOffset = Math.round((height - 500) / 2);
		
		// Create the window.
		overlay = $('<div class="bigtree_dialog_overlay">');
		this.browser = $('<div id="file_browser">');
		this.browser.css({ top: topOffset + "px", left: leftOffset + "px" });
		
		this.browser.html('\
<div class="header">\
	<input class="form_search" id="file_browser_search" placeholder="Search" />\
	<span class="form_search_icon"></span>\
	<a href="#" class="button add_file">Upload File</a>\
	<a href="#" class="button add_folder">New Folder</a>\
	<span id="file_browser_type_icon"></span>\
	<h2 id="file_browser_type"><em class="title"></em><em class="suffix"></em></h2>\
</div>\
<ul id="file_browser_breadcrumb"><li><a href="#0">Home</a></li></ul>\
<div id="file_browser_upload_window" style="display: none;">\
	<span style="display: none;" id="file_browser_spinner" class="spinner"></span>\
	<iframe name="resource_frame" id="file_browser_upload_frame" style="display: none;" src="admin_root/ajax/file-browser/busy/"></iframe>\
	<form id="file_browser_upload_form" target="resource_frame" method="post" enctype="multipart/form-data" action="admin_root/ajax/file-browser/upload/">\
		<input type="hidden" name="MAX_FILE_SIZE" value="{max_file_size}" />\
		<input type="file" name="file" id="file_browser_file_input" /> \
		<input type="submit" class="shorter blue" value="Upload" />\
	</form>\
</div>\
<form method="post" action="" id="file_browser_form">\
	<input type="hidden" id="file_browser_selected_file" value="" />\
	<div id="file_browser_contents"></div>\
	<div id="file_browser_info_pane"></div>\
	<div class="footer">\
		<input type="submit" class="button white" value="Cancel" id="file_browser_cancel" />\
		<input type="submit" class="button blue" value="Use Selected Item" style="display: none;" />\
	</div>\
</form>');

		$("body").append(overlay).append(this.browser);
		
		// Hook the cancel, submit, and search.
		$("#file_browser_cancel").click($.proxy(this.closeFileBrowser,this));
		$("#file_browser_form").submit($.proxy(this.submitSelectedFile,this));
		$("#file_browser_search").keyup(function() {
			clearTimeout(BigTreeFileManager.startSearchTimer);
			BigTreeFileManager.startSearchTimer = setTimeout("BigTreeFileManager.search()",300);
		});
		
		// Hide TinyMCE's default modal background, we're using our own.
		$("#mceModalBlocker").hide();
		
		// Handle the clicks on the breadcrumb of folders
		$("#file_browser_breadcrumb").on("click","a",function() {
			folder = $(this).attr("href").substr(1);

			if (BigTreeFileManager.type == "image" || BigTreeFileManager.type == "photo-gallery") {
				BigTreeFileManager.openImageFolder(folder);
			} else {
				BigTreeFileManager.openFileFolder(folder);
			}
			
			return false;
		});
		
		// Handle the create new folder / file clicks
		$("#file_browser .header .add_file").click($.proxy(this.addFile,this));
		$("#file_browser .header .add_folder").click($.proxy(this.addFolder,this));
		
		// Open the right browser
		if (type == "image" || type == "photo-gallery") {
			this.imageBrowser();
		} else {
			this.fileBrowser();
		}
	},
	
	openFileFolder: function(folder) {
		this.currentFolder = folder;
		$("#file_browser_selected_file").val("");
		$("#file_browser_info_pane").html("");
		$("#file_browser_contents").load("admin_root/ajax/file-browser/get-files/", { folder: folder }, $.proxy(this.fileBrowserPopulated,this));
	},
	
	openImageFolder: function(folder) {
		this.currentFolder = folder;
		$("#file_browser_selected_file").val("");
		$("#file_browser_info_pane").html("");
		$("#file_browser_contents").load("admin_root/ajax/file-browser/get-images/", { minWidth: this.minWidth, minHeight: this.minHeight, folder: folder }, $.proxy(this.imageBrowserPopulated,this));
	},
	
	saveFileTitle: function() {
		title = $("#file_browser_detail_title_input").val();
		file = $("#file_browser_selected_file").val();
		
		$.ajax("admin_root/ajax/file-browser/save-title/", { type: "POST", data: { file: file, title: title } });
	},
	
	search: function() {
		query = $("#file_browser_search").val();
		$("file_browser_info_pane").html("");
		$("file_browser_selected_file").val("");
		
		if (BigTreeFileManager.type == "image") {
			$("#file_browser_contents").load("admin_root/ajax/file-browser/get-images/", { minWidth: this.minWidth, minHeight: this.minHeight, query: query, folder: this.currentFolder }, $.proxy(this.imageBrowserPopulated,this));
		} else {
			$("#file_browser_contents").load("admin_root/ajax/file-browser/get-files/", { query: query, folder: this.currentFolder }, $.proxy(this.fileBrowserPopulated,this));
		}
	},
	
	setBreadcrumb: function(contents) {
		$("#file_browser_breadcrumb").html(contents);
	},
	
	setTitleSuffix: function(suffix) {
		$("#file_browser_type .suffix").html(suffix);
	},
	
	submitSelectedFile: function() {
		if (this.fieldName) {
			if (this.type == "image" && this.availableThumbs.length) {
				this.chooseImageSize();
				return false;
			} else {
				this.fieldName.value = $("#file_browser_selected_file").val();
				return this.closeFileBrowser();
			}
		} else {
			if (this.type == "image") {
				input = $('<input type="hidden" name="' + this.currentlyKey + '">');
				input.val("resource://" + $("#file_browser_selected_file").val());
				img = new $('<img alt="">');
				img.attr("src",$("#file_browser_selected_file").val());
				container = $(document.getElementById(this.currentlyName));
				container.find("img, input").remove();
				container.append(input).find(".currently_wrapper").append(img);
				container.show();
			} else if (this.type == "photo-gallery") {
				this.callback($("#file_browser_selected_file").val(),$("#file_browser_detail_title_input").val(),$(".file_browser_images .selected img").attr("src"));
			}
			return this.closeFileBrowser();
		}
	},
	
	tinyMCEOpen: function(field_name,url,type,win) {
		this.currentlyName = false;
		this.fieldName = win.document.forms[0].elements[field_name];
		this.open(type,false,false);
	}
};

// !BigTreeFormNavBar
var BigTreeFormNavBar = {

	moreContainer: false,
	
	init: function() {
		// Calculate the width of the navigate
		calc_nav_container = $(".container nav .more div");
		nav_width = calc_nav_container.width();
		if (nav_width > 928) {
			// If we're larger than 928, we're splitting into pages
			BigTreeFormNavBar.moreContainer = calc_nav_container.parent();
			
			page_count = 0;
			current_width = 0;
			current_page = $('<div class="nav_page active">');
			nav_items = $(".container nav a");
			for (x = 0; x < nav_items.length; x++) {
				item = nav_items.eq(x);
				width = item.width() + 47;
				
				if ((current_width + width) > 848) {
					page_count++;
					if (page_count > 1) {
						lessButton = $('<a class="more_nav" href="#">');
						lessButton.html("&laquo;");
						lessButton.click(function() {
							$(BigTreeFormNavBar.moreContainer).animate({ marginLeft: + (parseInt(BigTreeFormNavBar.moreContainer.css("margin-left")) + 928) + "px" }, 300);
							return false;
						});
						current_page.prepend(lessButton);
					}
					
					moreButton = $('<a class="more_nav" href="#">');
					moreButton.html("&raquo;");
					moreButton.click(function() {
						$(BigTreeFormNavBar.moreContainer).animate({ marginLeft: + (parseInt(BigTreeFormNavBar.moreContainer.css("margin-left")) - 928) + "px" }, 300);
						return false;
					});
					current_page.append(moreButton);
					
					BigTreeFormNavBar.moreContainer.append(current_page);
					current_page = $('<div class="nav_page">');
					current_width = 0;
				}
				
				current_width += width;
				current_page.append(item);
			}
			
			
			lessButton = $('<a class="more_nav" href="#">');
			lessButton.html("&laquo;");
			lessButton.click(function() {
				$(BigTreeFormNavBar.moreContainer).animate({ marginLeft: + (parseInt(BigTreeFormNavBar.moreContainer.css("margin-left")) + 928) + "px" }, 300);
				return false;
			});
			current_page.prepend(lessButton);
			
			BigTreeFormNavBar.moreContainer.append(current_page);
			calc_nav_container.remove();
		}
	}
}

// !BigTreeArrayOfItems
var BigTreeArrayOfItems = Class.extend({
	count: 0,
	field: false,
	key: false,
	options: false,
	activeField: false,
	
	init: function(id,count,key,options) {
		this.count = count;
		this.options = options;
		this.key = key;
		this.field = $("#" + id);
		this.field.find("ul").sortable({ axis: "y", containment: "parent", handle: ".icon_sort", items: "li", placeholder: "ui-sortable-placeholder", tolerance: "pointer" });
		this.field.find(".add").click($.proxy(this.addItem,this));
		this.field.on("click",".icon_edit",$.proxy(this.editItem,this));
		this.field.on("click",".icon_delete",this.deleteItem);
	},
	
	addItem: function(ev) {
		html = "";
		tinymces = [];
		datepickers = [];
		timepickers = [];
		for (field in this.options) {
			f = this.options[field];
			html += '<fieldset>';
			if (f.type != "checkbox") {
				html += '<label>' + f.title + '</label>';
			}
			
			if (f.type == "text" || !f.type) {
				html += '<input type="text" name="' + f.key + '" />';
			} else if (f.type == "textarea") {
				html += '<textarea name="' + f.key + '"></textarea>';
			} else if (f.type == "html") {
				html += '<textarea name="' + f.key + '" id="aoi_' + f.key + '" class="is_html"></textarea>';
				tinymces[tinymces.length] = "aoi_" + f.key;
			} else if (f.type == "checkbox") {
				html += '<input type="checkbox" name="' + f.key + '" />';
				html += '<label class="for_checkbox">' + f.title + '</label>';
			} else if (f.type == "date") {
				html += '<input type="hidden" name="' + f.key + '" autocomplete="off" class="date_picker" id="aoi_' + f.key + '" />';
				html += '<div id="aoi_' + f.key + '_datepicker"></div>';
				datepickers[datepickers.length] = "aoi_" + f.key;
			} else if (f.type == "time") {
				html += '<input type="hidden" name="' + f.key + '" autocomplete="off" class="time_picker" id="aoi_' + f.key + '" />';
				html += '<div id="aoi_' + f.key + '_timepicker"></div>';
				timepickers[timepickers.length] = "aoi_" + f.key;
			}
			html += '</fieldset>';
		}
		
		html += '<br /><script>';
		if (tinymces.length) {
			html += 'tinyMCE.init({ skin : "BigTree", inlinepopups_skin: "BigTreeModal", theme: "advanced", mode: "exact", elements: "' + tinymces.join(',') + '", file_browser_callback: "BigTreeFileManager.tinyMCEOpen", plugins: "inlinepopups,paste", theme_advanced_buttons1: "link,unlink,bold,italic,underline,pasteword,code", theme_advanced_buttons2: "", theme_advanced_buttons3: "", theme_advanced_disable: "cleanup,charmap",	theme_advanced_toolbar_location: "top", theme_advanced_toolbar_align: "left", theme_advanced_statusbar_location : "bottom", theme_advanced_resizing: true, theme_advanced_resize_horizontal: false, theme_advanced_resize_vertial: true, paste_remove_spans: true, paste_remove_styles: true, paste_strip_class_attributes: true, paste_auto_cleanup_on_paste: true, gecko_spellcheck: true, relative_urls: false, remove_script_host: false, extended_valid_elements : "object[classid|codebase|width|height|align],param[name|value],embed[quality|type|pluginspage|width|height|src|align]" });';
		}
		for (i = 0; i < datepickers.length; i++) {
			html += '$("#' + datepickers[i] + '_datepicker").datepicker({ onSelect: function(dateText) { $("#' + datepickers[i] + '").val(dateText); } });';
		}
		for (i = 0; i < timepickers.length; i++) {
			html += '$("#' + timepickers[i] + '_timepicker").timepicker({ ampm: true, hourGrid: 6,	minuteGrid: 10, onSelect: function(dateText) { $("#' + timepickers[i] + '").val(dateText); } });';
		}
		html += 'BigTreeCustomControls();</script>';
		
		new BigTreeDialog("Add Item",html,$.proxy(function(data) {
			li = $('<li><input type="hidden" name="' + this.key + '[' + this.count + ']" /><span class="icon_sort"></span><p></p><a href="#" class="icon_delete"></a><a href="#" class="icon_edit"></a></li>');
			li.find("input").val(json_encode(data));
			// Get the first element returned so we can put it in as a description
			for (i in data) {
				first = data[i];
				break;
			}
			li.find("p").html(first);
			this.field.find("ul").append(li);
			this.count++;
		},this),"add",false,"Add");
		
		return false;
	},
	
	editItem: function(ev) {
		data = eval("(" + $(ev.target).parents("li").find("input").val() + ")");
		
		html = "";
		tinymces = [];
		datepickers = [];
		timepickers = [];
		timepickervals = [];
		for (field in this.options) {
			f = this.options[field];
			if (data[f.key]) {
				v = htmlspecialchars(data[f.key]);				
			} else {
				v = "";
			}
			html += '<fieldset>';
			if (f.type != "checkbox") {
				html += '<label>' + f.title + '</label>';
			}
			
			if (f.type == "text" || !f.type) {
				html += '<input type="text" name="' + f.key + '" value="' + v + '" />';
			} else if (f.type == "textarea") {
				html += '<textarea name="' + f.key + '">' + v + '</textarea>';
			} else if (f.type == "html") {
				html += '<textarea name="' + f.key + '" id="aoi_' + f.key + '" class="is_html">' + v + '</textarea>';
				tinymces[tinymces.length] = "aoi_" + f.key;
			} else if (f.type == "checkbox") {
				if (v) {
					html += '<input type="checkbox" name="' + f.key + '" checked="checked" />';
				} else {
					html += '<input type="checkbox" name="' + f.key + '" />';
				}
				html += '<label class="for_checkbox">' + f.title + '</label>';
			} else if (f.type == "date") {
				html += '<input type="hidden" name="' + f.key + '" autocomplete="off" class="date_picker" id="aoi_' + f.key + '" value="' + v + '" />';
				html += '<div id="aoi_' + f.key + '_datepicker"></div>';
				datepickers[datepickers.length] = "aoi_" + f.key;
			} else if (f.type == "time") {
				html += '<input type="hidden" name="' + f.key + '" autocomplete="off" class="time_picker" id="aoi_' + f.key + '" value="' + v + '" />';
				html += '<div id="aoi_' + f.key + '_timepicker"></div>';
				timepickers[timepickers.length] = "aoi_" + f.key;
				timepickervals[timepickervals.length] = v;
			}
			html += '</fieldset>';
		}
		
		html += '<br /><script>';
		if (tinymces.length) {
			html += 'tinyMCE.init({ skin : "BigTree", inlinepopups_skin: "BigTreeModal", theme: "advanced", mode: "exact", elements: "' + tinymces.join(',') + '", file_browser_callback: "BigTreeFileManager.tinyMCEOpen", plugins: "inlinepopups,paste", theme_advanced_buttons1: "link,unlink,bold,italic,underline,pasteword,code", theme_advanced_buttons2: "", theme_advanced_buttons3: "", theme_advanced_disable: "cleanup,charmap",	theme_advanced_toolbar_location: "top", theme_advanced_toolbar_align: "left", theme_advanced_statusbar_location : "bottom", theme_advanced_resizing: true, theme_advanced_resize_horizontal: false, theme_advanced_resize_vertial: true, paste_remove_spans: true, paste_remove_styles: true, paste_strip_class_attributes: true, paste_auto_cleanup_on_paste: true, gecko_spellcheck: true, relative_urls: false, remove_script_host: false, extended_valid_elements : "object[classid|codebase|width|height|align],param[name|value],embed[quality|type|pluginspage|width|height|src|align]" });';
		}
		for (i = 0; i < datepickers.length; i++) {
			html += '$("#' + datepickers[i] + '_datepicker").datepicker({ defaultDate: $("#' + datepickers[i] + '").val(), onSelect: function(dateText) { $("#' + datepickers[i] + '").val(dateText); } });';
		}
		for (i = 0; i < timepickers.length; i++) {
			d = BigTree.ParseTime(timepickervals[i]);
			html += '$("#' + timepickers[i] + '_timepicker").timepicker({ hour: ' + d.getHours() + ', minute: ' + d.getMinutes() + ', ampm: true, hourGrid: 6, minuteGrid: 10, onSelect: function(dateText) { $("#' + timepickers[i] + '").val(dateText); } });';
		}
		html += 'BigTreeCustomControls();</script>';
		
		this.activeField = $(ev.target).parents("li");
		
		new BigTreeDialog("Edit Item",html,$.proxy(function(data) {
			li = $('<li><input type="hidden" name="' + this.key + '[' + this.count + ']" /><span class="icon_sort"></span><p></p><a href="#" class="icon_delete"></a><a href="#" class="icon_edit"></a></li>');
			li.find("input").val(json_encode(data));
			// Get the first element returned so we can put it in as a description
			for (i in data) {
				first = data[i];
				break;
			}
			li.find("p").html(first);
			this.activeField.replaceWith(li);
			this.count++;
		},this),"edit",false,"Update");
		
		return false;
	},
	
	deleteItem: function() {
		new BigTreeDialog("Delete Item",'<p class="confirm">Are you sure you want to delete this item?</p>',$.proxy(function() {
			$(this).parents("li").remove();		
		},this),"delete",false,"OK");

		return false;
	}
});


// !BigTreeListMaker
var BigTreeListMaker = Class.extend({
	
	container: false,
	name: false,
	keys: [],
	count: 0,
	
	init: function(selector,name,title,columns,keys,existing) {
		this.container = $(selector);
		this.keys = keys;
		this.name = name;
		
		// Add the title
		html = '<h4>' + title + ' <a href="#" class="add_option icon_small icon_small_add"></a></h4>';
		if (keys.length == 1) {
			lclass = "list_options_widget_1";
		} else if (keys.length == 2) {
			lclass = "list_options_widget_2";
		} else if (keys.length == 3) {
			lclass = "list_options_widget_3";
		} else {
			alert("Error: Too many keys. Maximum is 3.");
		}
		html += '<fieldset class="list_options_widget ' + lclass + '">';
		
		// Add the column headers
		html += '<summary>';
		for (i = 0; i < columns.length; i++) {
			html += '<span>' + columns[i] + '</span>';
		}
		html += '</summary>';
		
		// Add the options
		html += '<ul>';
		count = 0;
		for (i in existing) {
			html += '<li><span class="icon_sort"></span>';
			for (x = 0; x < keys.length; x++) {
				if (keys[x].type == "select") {
					html += '<span><select class="custom_control" name="' + name + '[' + count + '][' + keys[x].key + ']">';
					for (v in keys[x].list) {
						html += '<option value="' + htmlspecialchars(v) + '"';
						if (v == existing[i][keys[x].key]) {
							html += ' selected="selected"';
						}
						html += '>' + htmlspecialchars(keys[x].list[v]) + '</option>';
					}
					html += '</select></span>';
				} else {
					html += '<span><input type="text" name="' + name + '[' + count + '][' + keys[x].key + ']" value="' + htmlspecialchars(existing[i][keys[x].key]) + '" /></span>';
				}
			}
			html += '<a class="delete icon_small icon_small_delete" href="#"></a></li>';
			count++;
		}
		html += '</ul>';
		this.container.html(html);
		
		// Hide the summary if we have no options
		if (!existing || existing.length == 0) {
			this.container.find("summary").hide();
		}
		// Hook the add button
		this.container.find(".add_option").click($.proxy(this.addOption,this));
		// Hook delete buttons
		this.container.on("click",".delete",this.deleteOption);
		// Make it sortable
		this.container.sortable({ handle: ".icon_sort", axis: "y", containment: "parent", items: "li", placeholder: "ui-sortable-placeholder" });
		// Set the count of options
		this.count = count;
	},
	
	addOption: function() {
		html = '<li><span class="icon_sort"></span>';
		for (x = 0; x < this.keys.length; x++) {
			if (this.keys[x].type == "select") {
				html += '<span><select class="custom_control" name="' + this.name + '[' + this.count + '][' + this.keys[x].key + ']">';
				for (v in this.keys[x].list) {
					html += '<option value="' + htmlspecialchars(v) + '">' + htmlspecialchars(this.keys[x].list[v]) + '</option>';
				}
				html += '</select></span>';
			} else {
				html += '<span><input type="text" name="' + this.name + '[' + this.count + '][' + this.keys[x].key + ']" /></span>';
			}
		}
		html += '<a class="delete icon_small icon_small_delete" href="#"></a></li>';
		// Add the option, increment the count
		this.container.find("ul").append(html);
		this.count++;
		// We're guaranteed at least one option now, so show the header.
		this.container.find("summary").show();

		return false;
	},
	
	deleteOption: function() {
		ul = $(this).parents("ul").eq(0);
		$(this).parents("li").eq(0).remove();
		// Hide the header if we're out of options
		if (ul.find("li").length == 0) {
			ul.prev("summary").hide();
		}

		return false;
	}

});


// !BigTreeManyToMany
var BigTreeManyToMany = Class.extend({
	count: 0,
	field: false,
	key: false,
	sortable: false,
	
	init: function(id,count,key,sortable) {
		this.count = count;
		this.key = key;
		this.field = $("#" + id);
		if (sortable) {
			this.field.find("ul").sortable({ items: "li", handle: ".icon_sort" });
			this.sortable = true;
		}
		this.field.find(".add").click($.proxy(this.addItem,this));
		this.field.on("click",".icon_delete",this.deleteItem);
	},
	
	addItem: function() {
		select = this.field.find("select").get(0);
		val = select.value;
		text = select.options[select.selectedIndex].text;
		if (this.sortable) {
			li = $('<li><input type="hidden" name="' + this.key + '[' + this.count + ']" /><span class="icon_sort"></span><p></p><a href="#" class="icon_delete"></a></li>');
		} else {
			li = $('<li><input type="hidden" name="' + this.key + '[' + this.count + ']" /><p></p><a href="#" class="icon_delete"></a></li>');		
		}
		li.find("p").html(text);
		li.find("input").val(val);

		// Remove the option from the select.
		select.customControl.remove(val);
		
		this.field.find("ul").append(li);
		this.count++;
		// Hide the instructions saying there haven't been any items tagged.
		this.field.find("section").hide();

		return false;
	},
	
	deleteItem: function() {
		new BigTreeDialog("Delete Item",'<p class="confirm">Are you sure you want to delete this item?</p>',$.proxy(function() {
			// If this is the last item we're removing, show the instructions again.
			if ($(this).parents("ul").find("li").length == 1) {
				$(this).parents("fieldset").find("section").show();
			}
			$(this).parents("li").remove();
		},this),"delete",false,"OK");

		return false;
	}
});

// !BigTreeFieldSelect
var BigTreeFieldSelect = Class.extend({
	addCallback: false,
	currentElement: 0,
	elements: false,
	container: false,
	
	init: function(selector,elements,callback) {
		fs = $('<div class="field_selector">');
		ophtml = "";
		for (i = 0; i < elements.length; i++) {
			ophtml += '<a href="#' + elements[i].title + '">' + elements[i].field + '</a>';
		}
		if (elements.length == 0) {
			fs.html('<a href="#" class="add_field"></a><div><span class="dd">' + ophtml + '</span></div><span class="handle"></span><span class="current"><p></p>' + ophtml + '</span>');
		} else {
			fs.html('<a href="#" class="add_field"></a><div><span class="dd">' + ophtml + '</span></div><span class="handle"></span><span class="current"><p>' + elements[0].field + '</p>' + ophtml + '</span>');
		}
		$(selector).prepend(fs);
		
		fs.find("p, .handle").click($.proxy(this.click,this));
		
		fs.find(".dd").on("click","a",$.proxy(function(ev) {
			el = ev.currentTarget;
			p = $(el).parents(".field_selector");
			p.find("p").html($(el).html());
			i = p.find(".dd").hide().find("a").index(el);
			this.currentElement = i;
			return false;
		},this));
		
		fs.find(".add_field").click($.proxy(function() {
			el = this.elements[this.currentElement];
			this.addCallback(el,this);
			return false;
		},this));
		
		this.elements = elements;
		this.container = fs;
		this.addCallback = callback;
		
		if (this.elements.length == 0) {
			this.container.hide();
		}
	},
	
	addField: function(field,title) {
		this.container.find(".dd").append($('<a href="#' + title + '">' + field + '</a>'));
		this.container.find(".current").append($('<a href="#' + title + '">' + field + '</a>'));
		this.elements.push({ field: field, title: title });
		if (this.elements.length == 1) {
			this.container.find("p").html(this.elements[0].field);
			this.container.show();
		}
	},
	
	click: function(ev) {
		p = $(ev.currentTarget);
		dd = p.parents(".field_selector").find(".dd");
		if (dd.hasClass("open")) {
			this.close();
		} else {
			if (dd.find("a").length > 1) {
				dd.show().addClass("open");
				this.BoundWindowClick = $.proxy(this.close,this);
				$("body").bind("click",this.BoundWindowClick);
			}
		}
		return false;
	},
	
	close: function() {
		$(window).unbind("click",this.BoundWindowClick);
		$(".field_selector .dd").removeClass("open").hide();
	},
	
	removeCurrent: function() {
		this.container.find(".dd a").eq(this.currentElement).remove();
		this.container.find(".current a").eq(this.currentElement).remove();
		this.elements.splice(this.currentElement,1);
		this.currentElement = 0;
		if (this.elements.length == 0) {
			this.container.hide();
		} else {
			this.container.find("p").html(this.elements[0].field);
		}
	}
});

// !BigTreeFormValidator
var BigTreeFormValidator = Class.extend({
	form: false,
	callback: false,
	
	init: function(selector,callback) {
		this.form = $(selector);
		this.form.submit($.proxy(this.validateForm,this));
		if (callback) {
			this.callback = callback;
		}
	},
	
	validateForm: function(event,in_dialog) {
		errors = [];
		this.form.find(".form_error").removeClass("form_error");
		this.form.find(".form_error_reason").remove();
		
		this.form.find("input.required, select.required, textarea.required").each(function() {
			if ($(this).nextAll(".mceEditor").length) {
				val = tinyMCE.get($(this).attr("id")).getContent();
			} else if ($(this).parents("div").nextAll(".currently, .currently_file").length) {
				val = $(this).parents("div").nextAll(".currently, .currently_file").find("input").val();
				if (!val) {
					val = $(this).val();
				}
			} else {
				val = $(this).val();
			}
			if (!val) {
				errors[errors.length] = $(this);
				$(this).parents("fieldset").addClass("form_error");
				$(this).prevAll("label").append($('<span class="form_error_reason">Required</span>'));
				$(this).parents("div").prevAll("label").append($('<span class="form_error_reason">Required</span>'));
			}
		});
		
		this.form.find("input.numeric").each(function() {
			if (isNaN($(this).val())) {
				errors[errors.length] = $(this);
				$(this).parents("fieldset").addClass("form_error");
				$(this).prevAll("label").append($('<span class="form_error_reason">This Field Must Be Numeric</span>'));
			}
		});
		
		this.form.find("input.email").each(function() {
			reg = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			val = $(this).val();
			if (val && !reg.test(val)) {
				errors[errors.length] = $(this);
				$(this).parents("fieldset").addClass("form_error");
				$(this).prevAll("label").append($('<span class="form_error_reason">This Field Must Be An Email Address</span>'));
			}
		});
		
		this.form.find("input.link").each(function() {
			reg = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
			val = $(this).val();
			if (val && !reg.test(val)) {
				errors[errors.length] = $(this);
				$(this).parents("fieldset").addClass("form_error");
				$(this).prevAll("label").append($('<span class="form_error_reason">This Field Must Be A Valid URL</span>'));
			}
		});
		
		if (this.form.find(".form_error").length) {
			this.form.find(".error_message").show();
			if (!in_dialog) {
				$("html, body").animate({ scrollTop: $(".container").offset().top }, 200);
			} else {
				this.form.find(".overflow, #callout_resources").animate({ scrollTop: 0 }, 200);
			}
			if (this.callback) {
				this.callback(errors);
			}
			return false;
		} else {
			return true;
		}
	}
});

// !BigTreeToolTip
var BigTreeToolTip = Class.extend({
	container: false,
	position: false,
	selector: false,
	
	init: function(selector,content,position,icon,auto_close) {
		// If you don't specify an icon, just use the alert one.
		if (!icon) {
			icon = "alert";
		}
		// Create the container, add the tip to the container.
		container = $('<div class="tooltip" style="display: none;">');
		// The arrow is below the tip if the position is above.
		if (position != "above") {
			container.append($('<span class="arrow">'));
		}
		tip = $('<article>');
		tip.html('<section class="icon_tooltip icon_growl_' + icon + '"></section><section class="content">' + content + '</section>');
		// If the tip should stay open, add a close button.  Otherwise it'll close when you roll off the target.
		if (!auto_close) {
			tip.append($('<a href="#" class="close"></a>'));
			tip.find(".close").click($.proxy(this.close,this));
		}
		container.append(tip);
		container.addClass("tooltip_" + position);
		if (position == "above") {
			container.append($('<span class="arrow">'));
		}
		$("body").append(container);
		
		this.position = position;
		this.container = container;
		this.selector = selector;
		
		if (auto_close) {
			$(selector).mouseenter($.proxy(this.showTip,this));
			$(selector).mouseleave($.proxy(function() { this.container.stop().fadeTo(200, 0, function() { $(this).hide(); }); },this));
		} else {
			$(selector).click($.proxy(this.showTip,this));
		}
	},
	
	close: function() {
		this.container.stop().fadeTo(200, 0, function() { $(this).hide(); });
		return false;
	},
	
	showTip: function() {
		// Figure out where the target is in the DOM, add the container to the DOM so we can get its width/height for some positions.
		offset = $(this.selector).offset();
		w = $(this.selector).width();
		h = $(this.selector).height();
		
		// The tip is below the target.
		if (this.position == "below") {
			l = offset.left - 28 + Math.round(w / 2);
			t = offset.top + h + 5;
		}
		
		// The tip is to the right of the target.
		if (this.position == "right") {
			l = offset.left + w + 5;
			t = offset.top - 28 + Math.round(h / 2);
		}
		
		// The tip is to the left of the target.
		if (this.position == "left") {
			l = offset.left - container.width() - 5;
			t = offset.top - 28 + Math.round(h / 2);
		}
		
		// The tip is above of the target.
		if (this.position == "above") {
			l = offset.left - 28 + Math.round(w / 2);
			t = offset.top - container.height() - 5;
		}
		
		this.container.css({ left: l + "px", top: t + "px" }).stop().fadeTo(200, 1);
	}
});

// !BigTree Foundry Browser Class
var BigTreeFoundryBrowser = Class.extend({

	onComplete: false,

	init: function(directory,oncomplete) {
		this.onComplete = oncomplete;
		overlay = $('<div class="bigtree_dialog_overlay">');
		browserwindow = $('<div id="bigtree_foundry_browser_window">');
		browserwindow.html('<h2>File Browser</h2><form id="bigtree_foundry_browser_form" method="post" action="">Please Wait...</form>');
		$("body").append(overlay).append(browserwindow);
		$("#bigtree_foundry_browser_form").load("admin_root/ajax/foundry/file-browser/", { directory: directory });

		leftd = parseInt((BigTree.WindowWidth() - 602) / 2);
		topd = parseInt((BigTree.WindowHeight() - 402) / 2);

		$("#bigtree_foundry_browser_window").css({ "top": topd + "px", "left": leftd + "px" });
		$("#bigtree_foundry_browser_form").submit($.proxy(this.BrowserSubmit,this));
	},

	BrowserSubmit: function(ev) {
		data = { file: $("#bigtree_foundry_selected_file").val(), directory: $("#bigtree_foundry_directory").val() };
		this.onComplete(data);
		$(".bigtree_dialog_overlay").last().remove();
		$("#bigtree_foundry_browser_window").remove();
		return false;

	}
});

// !BigTree Object
var BigTree = {

	CleanHref: function(href) {
		return href.substr(href.indexOf("#")+1);
	},

	GetCallout: function() {
		last_dialog = $(".bigtree_dialog_form").last();

		// Validate required fields.
		v = new BigTreeFormValidator(last_dialog);
		if (!v.validateForm(false,true)) {
			return false;
		}
		
		li = $('<li>');
		li.html('<h4></h4><p>' + $("#callout_type select").get(0).options[$("#callout_type select").get(0).selectedIndex].text + '</p><div class="bottom"><span class="icon_drag"></span><a href="#" class="icon_delete"></a></div>');
		
		callout_number = last_dialog.find("input.callout_count").val();
		// Try our best to find some way to describe the callout
		callout_desc = "";
		callout_desc_field = last_dialog.find("[name='" + last_dialog.find(".display_field").val() + "']");
		if (callout_desc_field.is('select')) {
			callout_desc = callout_desc_field.find("option:selected").text();
		} else {
			callout_desc = callout_desc_field.val();
		}
		if ($.trim(callout_desc) == "") {
			callout_desc = last_dialog.find(".display_default").val();
		}
		
		// Append all the relevant fields into the callout field so that it gets saved on submit with the rest of the form.
		last_dialog.find("input, textarea, select").each(function() {
			if ($(this).attr("type") != "submit") {
				if ($(this).is("textarea") && $(this).css("display") == "none" && $(this).attr("type") != "file" && $(this).attr("type") != "hidden") {
					var mce = tinyMCE.get($(this).attr("id"));
					if (mce) {
						mce.save();
						tinyMCE.execCommand('mceRemoveControl',false,$(this).attr("id"));
					}
				}
				$(this).hide();
				li.append($(this));
			}
		});

		return li;
	},

	growltimer: false,
	growling: false,
	Growl: function(title,message,time,type) {
		if (!time) {
			time = 5000;
		}
		if (!type) {
			type = "success";
		}
		if (BigTree.Growling) {
			$("#growl").append($('<article><a class="close" href="#"></a><span class="icon_growl_' + type + '"></span><section><h3>' + title + '</h3><p>' + message + '</p></section></article>'));
			BigTree.Growltimer = setTimeout("$('#growl').fadeOut(500); BigTree.Growling = false;",time);
		} else {
			$("#growl").html('<article><a class="close" href="#"></a><span class="icon_growl_' + type + '"></span><section><h3>' + title + '</h3><p>' + message + '</p></section></article>');
			BigTree.Growling = true;
			$("#growl").fadeIn(500, function() { BigTree.Growltimer = setTimeout("$('#growl').fadeOut(500); BigTree.Growling = false;",time); });
		}
	},

	ParserWatch: function() {
		name = $(this).attr("name");
		value = $(this).val();
		t = $('<textarea class="parser" name="' + name + '">');
		t.val(value);
		t.mouseleave(function() {
			name = $(this).attr("name");
			value = $(this).val();
			i = $('<input class="parser" name="' + name + '">');
			i.val(value);
			i.focus(BigTree.ParserWatch);
			i.replaceAll(this);
		});
		t.replaceAll(this);
		t.focus();
	},
	
	
	// Thanks to John Resig and Benji York
	// http://stackoverflow.com/questions/141348/what-is-the-best-way-to-parse-a-time-into-a-date-object-from-user-input-in-javas
	ParseTime: function(time) {
		var d = new Date();
		time = time.match(/(\d+)(?::(\d\d))?\s*([pP]?)/);
		if (time) {
			d.setHours(parseInt(time[1],10) + (time[3] ? 12 : 0));
			d.setMinutes(parseInt(time[2],10) || 0);
		} else {
			d.setHours(0);
			d.setMinutes(0);
		}
		return d;
	},
	
	SetPageCount: function(selector,pages,current_page) {
		// We have to have at least one page.
		if (pages == 0) {
			pages = 1;
		}
		
		// Figure out what previous and next buttons should do.
		if (current_page == 1) {
			prev_page = 1;
		} else {
			prev_page = current_page - 1;
		}
		if (current_page == pages) {
			next_page = pages;
		} else {
			next_page = current_page + 1;
		}
		
		// If we have 10 or less pages, just draw them all.
		if (pages < 11) {
			start_page = 1;
			end_page = pages;
		// Otherwise we need to figure out where we are...
		} else {
			if (current_page < 7) {
				start_page = 1;
				end_page = 9;
			} else if (current_page > pages - 7) {
				start_page = pages - 9;
				end_page = pages;
			} else {
				start_page = current_page - 4;
				end_page = current_page + 5;
			}
		}

		content = '<li class="first"><a href="#' + prev_page + '"><span>&laquo;</span></a></li>';
		if (start_page > 1) {
			content += '<li class="ellipsis"><a href="#0">…</a></li>';
		}
		for (i = start_page; i <= end_page; i++) {
			content += '<li><a href="#' + i + '"';
			if (i == current_page) {
				content += ' class="active"';
			}
			content += '>' + i + '</a></li>';
		}
		if (end_page < pages) {
			content += '<li class="ellipsis"><a href="#' + pages + '">…</a></li>';
		}
		content += '<li class="last"><a href="#' + next_page + '"><span>&raquo;</span></a></li>';
		
		$(selector).html(content);
	},

	SettingsAnimation: false,
	
	ThrowError: function(message) {
		alert(message);
	},
	
	WindowWidth: function() {
		if (window.innerWidth) {
			windowWidth = window.innerWidth;
		} else if (document.documentElement && document.documentElement.clientWidth) {
			windowWidth = document.documentElement.clientWidth;
		} else if (document.body) {
			windowWidth = document.body.clientWidth;
		}
		return windowWidth;
	},

	WindowHeight: function() {
		if (window.innerHeight) {
			windowHeight = window.innerHeight;
		} else if (document.documentElement && document.documentElement.clientHeight) {
			windowHeight = document.documentElement.clientHeight;
		} else if (document.body) {
			windowHeight = document.body.clientHeight;
		}
		return windowHeight;
	}
}