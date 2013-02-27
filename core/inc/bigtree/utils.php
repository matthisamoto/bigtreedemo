<?
	/*
		Class: BigTree
			A utilities class with many useful functions.
	
	*/
	
	class BigTree {
	
		/*
			Function: arrayToXML
				Turns a PHP array into an XML string.
			
			Parameters:
				array - The array to convert.
				tab - Current tab depth (for recursion).
			
			Returns:
				A string of XML.
		*/				
		
		static function arrayToXML($array,$tab = "") {
			$xml = "";
			foreach ($array as $key => $val) {
				if (is_array($val)) {
					$xml .= "$tab<$key>\n".self::arrayToXML($val,"$tab\t")."$tab</$key>\n";
				} else {
					if (strpos($val,">") === false && strpos($val,"<") === false && strpos($val,"&") === false) {
						$xml .= "$tab<$key>$val</$key>\n";
					} else {
						$xml .= "$tab<$key><![CDATA[$val]]></$key>\n";
					}
				}
			}
			return $xml;
		}
		
		/*
			Function: centerCrop
				Crop from the center of an image to create a new one.
			
			Parameters:
				file - The location of the image to crop.
				newfile - The location to save the new cropped image.
				cw - The crop width.
				ch - The crop height.
		*/
		
		static function centerCrop($file, $newfile, $cw, $ch) {
			list($w, $h) = getimagesize($file);
			
			// Find out what orientation we're cropping at.
			$v = $cw / $w;
			$nh = $h * $v;
			if ($nh < $ch) {
				// We're shrinking the height to the crop height and then chopping the left and right off.
				$v = $ch / $h;
				$nw = $w * $v;
				$x = ceil(($nw - $cw) / 2 * $w / $nw);
				$y = 0;
				self::createCrop($file,$newfile,$x,$y,$cw,$ch,($w - $x * 2),$h);
			} else {
				$y = ceil(($nh - $ch) / 2 * $h / $nh);
				$x = 0;
				self::createCrop($file,$newfile,$x,$y,$cw,$ch,$w,($h - $y * 2));
			}
		}
		
		/*
			Function: colorMesh
				Returns a color a % of the way between two colors.
			
			Parameters:
				first_color - The first color.
				second_color - The second color.
				percentage - The percentage between the first color and the second you want to move.
			
			Returns:
				A hex value color between the first and second colors.
		*/
		
		static function colorMesh($first_color,$second_color,$percentage) {
			$percentage = intval(str_replace("%","",$percentage));
			$first_color = ltrim($first_color,"#");
			$second_color = ltrim($second_color,"#");
		
			// Get the RGB values for the colors
			$fc_r = hexdec(substr($first_color,0,2));
			$fc_g = hexdec(substr($first_color,2,2));
			$fc_b = hexdec(substr($first_color,4,2));
		
			$sc_r = hexdec(substr($second_color,0,2));
			$sc_g = hexdec(substr($second_color,2,2));
			$sc_b = hexdec(substr($second_color,4,2));
		
			$r_diff = ceil(($sc_r - $fc_r) * $percentage / 100);
			$g_diff = ceil(($sc_g - $fc_g) * $percentage / 100);
			$b_diff = ceil(($sc_b - $fc_b) * $percentage / 100);
		
			$new_color = "#".str_pad(dechex($fc_r + $r_diff),2,"0",STR_PAD_LEFT).str_pad(dechex($fc_g + $g_diff),2,"0",STR_PAD_LEFT).str_pad(dechex($fc_b + $b_diff),2,"0",STR_PAD_LEFT);
		
			return $new_color;
		}
		
		/*
			Function: copyFile
				Copies a file into a directory, even if that directory doesn't exist yet.
			
			Parameters:
				from - The current location of the file.
				to - The location of the new copy.
			
			Returns:
				true if the copy was successful, false if the directories were not writable.
		*/
		
		static function copyFile($from,$to) {
			if (!self::isDirectoryWritable($to)) {
				return false;
			}
			// is_readable doesn't work on URLs
			if (substr($from,0,7) != "http://" && substr($from,0,8) != "https://" && !is_readable($from)) {
				return false;
			}
			$pathinfo = self::pathInfo($to);
			$file_name = $pathinfo["basename"];
			$directory = $pathinfo["dirname"];
			BigTree::makeDirectory($directory);
			
			copy($from,$to);
			chmod($to,0777);
			return true;
		}
		
		/*
			Function: createCrop
				Creates a cropped image from a source image.
			
			Parameters:
				file - The location of the image to crop.
				new_file - The location to save the new cropped image.
				x - The starting x value of the crop.
				y - The starting y value of the crop.
				target_width - The desired width of the new image.
				target_height - The desired height of the new image.
				width - The width to crop from the original image.
				height - The height to crop from the original image.
				retina - Whether to create a retina-style image (2x, lower quality) if able, defaults to false
				grayscale - Whether to make the crop be in grayscale or not, defaults to false
		*/
		
		static function createCrop($file,$new_file,$x,$y,$target_width,$target_height,$width,$height,$retina = false,$grayscale = false) {
			global $bigtree;
			
			$jpeg_quality = isset($bigtree["config"]["image_quality"]) ? $bigtree["config"]["image_quality"] : 90;
			
			// If we're doing a retina image we're going to check to see if the cropping area is at least twice the desired size
			if ($retina && ($x + $width) >= $target_width * 2 && ($y + $height) >= $target_height * 2) {
				$jpeg_quality = isset($bigtree["config"]["retina_image_quality"]) ? $bigtree["config"]["retina_image_quality"] : 25;
				$target_width *= 2;
				$target_height *= 2;
			}
			
			list($w, $h, $type) = getimagesize($file);
			$cropped_image = imagecreatetruecolor($target_width,$target_height);
			if ($type == IMAGETYPE_JPEG) {
				$original_image = imagecreatefromjpeg($file);
			} elseif ($type == IMAGETYPE_GIF) {
				$original_image = imagecreatefromgif($file);
			} elseif ($type == IMAGETYPE_PNG) {
				$original_image = imagecreatefrompng($file);
			}
			
			imagealphablending($original_image, true);
			imagealphablending($cropped_image, false);
			imagesavealpha($cropped_image, true);
			imagecopyresampled($cropped_image, $original_image, 0, 0, $x, $y, $target_width, $target_height, $width, $height);
			
			if ($grayscale) {
				imagefilter($cropped_image, IMG_FILTER_GRAYSCALE);
			}
		
			if ($type == IMAGETYPE_JPEG) {
				imagejpeg($cropped_image,$new_file,$jpeg_quality);
			} elseif ($type == IMAGETYPE_GIF) {
				imagegif($cropped_image,$new_file);
			} elseif ($type == IMAGETYPE_PNG) {
				imagepng($cropped_image,$new_file);
			}
			chmod($new_file,0777);
		
			imagedestroy($original_image);
			imagedestroy($cropped_image);
			
			return $new_file;
		}
		
		/*
			Function: createThumbnail
				Creates a thumbnailed image from a source image.
			
			Parameters:
				file - The location of the image to crop.
				new_file - The location to save the new cropped image.
				maxwidth - The maximum width of the new image (0 for no max).
				maxheight - The maximum height of the new image (0 for no max).
				retina - Whether to create a retina-style image (2x, lower quality) if able, defaults to false
				grayscale - Whether to make the crop be in grayscale or not, defaults to false
		*/
		
		static function createThumbnail($file,$new_file,$maxwidth,$maxheight,$retina = false,$grayscale = false) {
			global $bigtree;
			
			$jpeg_quality = isset($bigtree["config"]["image_quality"]) ? $bigtree["config"]["image_quality"] : 90;
			
			list($type,$w,$h,$result_width,$result_height) = self::getThumbnailSizes($file,$maxwidth,$maxheight,$retina);
			
			// If we're doing retina, see if 2x the height/width is less than the original height/width and change the quality.
			if ($retina && $result_width * 2 <= $w && $result_height * 2 <= $h) {
				$jpeg_quality = isset($bigtree["config"]["retina_image_quality"]) ? $bigtree["config"]["retina_image_quality"] : 25;
				$result_width *= 2;
				$result_height *= 2;
			}

			$thumbnailed_image = imagecreatetruecolor($result_width, $result_height);
			if ($type == IMAGETYPE_JPEG) {
				$original_image = imagecreatefromjpeg($file);
			} elseif ($type == IMAGETYPE_GIF) {
				$original_image = imagecreatefromgif($file);
			} elseif ($type == IMAGETYPE_PNG) {
				$original_image = imagecreatefrompng($file);
			}
		
			imagealphablending($original_image, true);
			imagealphablending($thumbnailed_image, false);
			imagesavealpha($thumbnailed_image, true);
			imagecopyresampled($thumbnailed_image, $original_image, 0, 0, 0, 0, $result_width, $result_height, $w, $h);
		
			if ($grayscale) {
				imagefilter($thumbnailed_image, IMG_FILTER_GRAYSCALE);
			}
		
			if ($type == IMAGETYPE_JPEG) {
				imagejpeg($thumbnailed_image,$new_file,$jpeg_quality);
			} elseif ($type == IMAGETYPE_GIF) {
				imagegif($thumbnailed_image,$new_file);
			} elseif ($type == IMAGETYPE_PNG) {
				imagepng($thumbnailed_image,$new_file);
			}
			chmod($new_file,0777);
			
			imagedestroy($original_image);
			imagedestroy($thumbnailed_image);
			
			return $new_file;
		}
		
		/*
			Function: cURL
				Posts to a given URL and returns the response.
				Wrapper for cURL.
			
			Parameters:
				url - The URL to retrieve / POST to.
				post - A key/value pair array of things to POST (optional).
				options - A key/value pair of extra cURL options (optional).
				strict_security - Force SSL verification of the host and peer if true.
			
			Returns:
				The string response from the URL.
		*/
		
		static function cURL($url,$post = false,$options = array(),$strict_security = false) {
			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			if (!$strict_security) {
				curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
				curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0); 
			}
			if ($post) {
				curl_setopt($ch, CURLOPT_POSTFIELDS, $post);
			}
			if (count($options)) {
				foreach ($options as $key => $opt) {
					curl_setopt($ch, $key, $opt);
				}
			}
			$output = curl_exec($ch);
			curl_close($ch);
			return $output;
		}
		
		/*
			Function: currentURL
				Return the current active URL with correct protocall and port
		*/
		static function currentURL() {
			$url = (@$_SERVER["HTTPS"] == "on") ? "https://" : "http://";
			if ($_SERVER["SERVER_PORT"] != "80") {
				$url .= $_SERVER["SERVER_NAME"] . ":" . $_SERVER["SERVER_PORT"] . $_SERVER["REQUEST_URI"];
			} else {
				$url .= $_SERVER["SERVER_NAME"] . $_SERVER["REQUEST_URI"];
			}
			return $url;
		}
				
		/*
			Function: deleteDirectory
				Deletes a directory including everything in it.
			
			Parameters:
				dir - The directory to delete.
		*/
		
		static function deleteDirectory($dir) {
			// Make sure it has a trailing /
			$dir = rtrim($dir,"/")."/";
			$r = opendir($dir);
			while ($file = readdir($r)) {
				if ($file != "." && $file != "..") {
					if (is_dir($dir.$file)) {
						self::deleteDirectory($dir.$file);
					} else {
						unlink($dir.$file);
					}
				}
			}
			rmdir($dir);
		}
		
		/*
			Function: describeTable
				Gives in depth information about a MySQL table's structure and keys.
			
			Parameters:
				table - The table name.
			
			Returns:
				An array of table information.
		*/
		
		static function describeTable($table,$db = false) {
			$result["columns"] = array();
			$result["indexes"] = array();
			$result["foreign_keys"] = array();
			$result["primary_key"] = false;
			
			// Make sure we don't throw an exception if the table doesn't exist.
			if (!self::tableExists($table)) {
				return false;
			}

			$f = sqlfetch(sqlquery("SHOW CREATE TABLE `$table`"));
			$lines = explode("\n",$f["Create Table"]);
			// Line 0 is the create line and the last line is the collation and such. Get rid of them.
			$main_lines = array_slice($lines,1,-1);
			foreach ($main_lines as $line) {
				$column = array();
				$line = rtrim(trim($line),",");
				if (substr($line,0,3) == "KEY") { // Keys
					$line = substr($line,5); // Take away "KEY `"
					// Get the key's name.
					$key_name = self::nextSQLColumnDefinition($line);
					// Get the key's content
					$line = substr($line,strlen($key_name) + substr_count($key_name,"`") + 4); // Skip ` (`
					$line = substr(rtrim($line,","),0,-1); // Remove trailing , and )
					$key_parts = array();
					$part = true;
					while ($line && $part) {
						$part = self::nextSQLColumnDefinition($line);
						$line = substr($line,strlen($part) + substr_count($part,"`") + 3);
						if ($part) {
							$key_parts[] = $part;
						}
					}
					$result["indexes"][$key_name] = $key_parts;
				} elseif (substr($line,0,7) == "PRIMARY") { // Primary Keys
					$line = substr($line,14); // Take away PRIMARY KEY (`
					$key_parts = array();
					$part = true;
					while ($line && $part) {
						$part = self::nextSQLColumnDefinition($line);
						$line = substr($line,strlen($part) + substr_count($part,"`") + 3);
						if ($part) {
							$key_parts[] = $part;
						}
					}
					$result["primary_key"] = $key_parts;
				} elseif (substr($line,0,10) == "CONSTRAINT") { // Foreign Keys
					$line = substr($line,12); // Remove CONSTRAINT `
					$key_name = self::nextSQLColumnDefinition($line);
					$line = substr($line,strlen($key_name) + substr_count($key_name,"`") + 16); // Remove ` FOREIGN KEY (`
					
					// Get local reference columns
					$local_columns = array();
					$part = true;
					$end = false;
					while (!$end && $part) {
						$part = self::nextSQLColumnDefinition($line);
						$line = substr($line,strlen($part) + 1); // Take off the trailing `
						if (substr($line,0,1) == ")") {
							$end = true;
						} else {
							$line = substr($line,2); // Skip the ,` 
						}
						$local_columns[] = $part;
					}

					// Get other table name
					$line = substr($line,14); // Skip ) REFERENCES `
					$other_table = self::nextSQLColumnDefinition($line);
					$line = substr($line,strlen($other_table) + substr_count($other_table,"`") + 4); // Remove ` (`

					// Get other table columns
					$other_columns = array();
					$part = true;
					$end = false;
					while (!$end && $part) {
						$part = self::nextSQLColumnDefinition($line);
						$line = substr($line,strlen($part) + 1); // Take off the trailing `
						if (substr($line,0,1) == ")") {
							$end = true;
						} else {
							$line = substr($line,2); // Skip the ,` 
						}
						$other_columns[] = $part;
					}

					$line = substr($line,2); // Remove ) 
					
					// Setup our keys
					$result["foreign_keys"][$key_name] = array("name" => $key_name, "local_columns" => $local_columns, "other_table" => $other_table, "other_columns" => $other_columns);

					// Figure out all the on delete, on update stuff
					$pieces = explode(" ",$line);
					$on_hit = false;
					$current_key = "";
					$current_val = "";
					foreach ($pieces as $piece) {
						if ($on_hit) {
							$current_key = strtolower("on_".$piece);
							$on_hit = false;
						} elseif ($piece == "ON") {
							if ($current_key) {
								$result["foreign_keys"][$key_name][$current_key] = $current_val;
								$current_key = "";
								$current_Val = "";
							}
							$on_hit = true;
						} else {
							$current_val = trim($current_val." ".$piece);
						}
					}
					if ($current_key) {
						$result["foreign_keys"][$key_name][$current_key] = $current_val;
					}
				} elseif (substr($line,0,1) == "`") { // Column Definition
					$line = substr($line,1); // Get rid of the first `
					$key = self::nextSQLColumnDefinition($line); // Get the column name.
					$line = substr($line,strlen($key) + substr_count($key,"`") + 2); // Take away the key from the line.
					
					// We need to figure out if the next part has a size definition
					$parts = explode(" ",$line);
					if (strpos($parts[0],"(") !== false) { // Yes, there's a size definition
						$type = "";
						// We're going to walk the string finding out the definition.
						$in_quotes = false;
						$finished_type = false;
						$finished_size = false;
						$x = 0;
						$size = "";
						$options = array();
						while (!$finished_size) {
							$c = substr($line,$x,1);
							if (!$finished_type) { // If we haven't finished the type, keep working on it.
								if ($c == "(") { // If it's a (, we're starting the size definition
									$finished_type = true;
								} else { // Keep writing the type
									$type .= $c;
								}
							} else { // We're finished the type, working in size definition
								if (!$in_quotes && $c == ")") { // If we're not in quotes and we encountered a ) we've hit the end of the size
									$finished_size = true;
								} else {
									if ($c == "'") { // Check on whether we're starting a new option, ending an option, or adding to an option.
										if (!$in_quotes) { // If we're not in quotes, we're starting a new option.
											$current_option = "";
											$in_quotes = true;
										} else {
											if (substr($line,$x + 1,1) == "'") { // If there's a second ' after this one, it's escaped.
												$current_option .= "'";
												$x++;
											} else { // We closed an option, add it to the list.
												$in_quotes = false;
												$options[] = $current_option;
											}
										}
									} else { // It's not a quote, it's content.
										if ($in_quotes) {
											$current_option .= $c;
										} elseif ($c != ",") { // We ignore commas, they're just separators between ENUM options.
											$size .= $c;
										}
									}
								}
							}
							$x++;
						}
						$line = substr($line,$x);
					} else { // No size definition
						$type = $parts[0];
						$line = substr($line,strlen($type) + 1);
					}
					
					$column["name"] = $key;
					$column["type"] = $type;
					if ($size) {
						$column["size"] = $size;
					}
					if ($type == "enum") {
						$column["options"] = $options;
					}
					$column["allow_null"] = true;
					$extras = explode(" ",$line);
					for ($x = 0; $x < count($extras); $x++) {
						$part = $extras[$x];
						if ($part == "NOT" && $extras[$x + 1] == "NULL") {
							$column["allow_null"] = false;
							$x++; // Skip NULL
						} elseif ($part == "CHARACTER" && $extras[$x + 1] == "SET") {
							$column["charset"] = $extras[$x + 2];
							$x += 2;
						} elseif ($part == "DEFAULT") {
							$default = "";
							$x++;
							if (substr($extras[$x],0,1) == "'") {
								while (substr($default,-1,1) != "'") {
									$default .= " ".$extras[$x];
									$x++;
								}
							} else {
								$default = $extras[$x];
							}
							$column["default"] = trim(trim($default),"'");
						} elseif ($part == "COLLATE") {
							$column["collate"] = $extras[$x + 1];
							$x++;
						} elseif ($part == "ON") {
							$column["on_".strtolower($extras[$x + 1])] = $extras[$x + 2];
							$x += 2;
						} elseif ($part == "AUTO_INCREMENT") {
							$column["auto_increment"] = true;
						}
					}
					
					$result["columns"][$key] = $column;
				}
			}
			
			$last_line = substr(end($lines),2);
			$parts = explode(" ",$last_line);
			foreach ($parts as $part) {
				list($key,$value) = explode("=",$part);
				if ($key && $value) {
					$result[strtolower($key)] = $value;
				}
			}
			
			return $result;
		}

		/*
			Function: formatBytes
				Formats bytes into larger units to make them more readable.
			
			Parameters:
				size - The number of bytes.
			
			Returns:
				A string with the number of bytes in kilobytes, megabytes, or gigabytes.
		*/
		
		static function formatBytes($size) {
			$units = array(' B', ' KB', ' MB', ' GB', ' TB');
			for ($i = 0; $size >= 1024 && $i < 4; $i++) {
				$size /= 1024;
			}
			return round($size, 2).$units[$i];
		}

		/*
			Function: formatCSS3
				Replaces CSS3 delcarations with vendor appropriate ones to reduce CSS redundancy.
			
			Parameters:
				css - CSS string.
			
			Returns:
				A string of CSS with vendor prefixes.
		*/

		static function formatCSS3($css) {
			// Background Gradients - background-gradient: #top #bottom
			$css = preg_replace_callback('/background-gradient:([^\"]*);/iU',create_function('$data','
				$d = trim($data[1]);
				list($stop,$start) = explode(" ",$d);
				$start_rgb = "rgb(".hexdec(substr($start,1,2)).",".hexdec(substr($start,3,2)).",".hexdec(substr($start,5,2)).")";
				$stop_rgb = "rgb(".hexdec(substr($stop,1,2)).",".hexdec(substr($stop,3,2)).",".hexdec(substr($stop,5,2)).")";
				return "background-image: -webkit-gradient(linear,left top,left bottom, color-stop(0, $start_rgb), color-stop(1, $stop_rgb)); background-image: -moz-linear-gradient(center top, $start_rgb 0%, $stop_rgb 100%); background-image: -ms-linear-gradient(top, $start_rgb 0%, $stop_rgb 100%); filter:progid:DXImageTransform.Microsoft.gradient(startColorstr=$start, endColorstr=$stop);-ms-filter: \"progid:DXImageTransform.Microsoft.gradient(startColorstr=$start, endColorstr=$stop)\"; zoom:1;";
			'),$css);
			
			// Border Radius - border-radius: 0px 0px 0px 0px
			$css = preg_replace_callback('/border-radius:([^\"]*);/iU', 'BigTree::formatVendorPrefixes', $css);
			
			// Box Shadow - box-shadow: 0px 0px 5px #color
			$css = preg_replace_callback('/box-shadow:([^\"]*);/iU', 'BigTree::formatVendorPrefixes', $css);
			
			// Column Count - column-count: number
			$css = preg_replace_callback('/column-count:([^\"]*);/iU', 'BigTree::formatVendorPrefixes', $css);
			
			// Column Rule - column-rule: 1px solid color
			$css = preg_replace_callback('/column-rule:([^\"]*);/iU', 'BigTree::formatVendorPrefixes', $css);
			
			// Column Gap - column-gap: number
			$css = preg_replace_callback('/column-gap:([^\"]*);/iU', 'BigTree::formatVendorPrefixes', $css);
			
			// Transition - transition: definition
			$css = preg_replace_callback('/transition:([^\"]*);/iU', 'BigTree::formatVendorPrefixes', $css);
			
			// User Select - user-select: none | text | toggle | element | elements | all | inherit
			$css = preg_replace_callback('/user-select:([^\"]*);/iU', 'BigTree::formatVendorPrefixes', $css);
			
			return $css;
		}
		
		/*
			Function: formatVendorPrefixes
				A preg_replace function for transforming a standard CSS3 entry into a vendor prefixed string.
			
			Parameters:
				data - preg data
			
			Returns:
				Replaced string.
		*/
		
		static function formatVendorPrefixes($data) {
			$p = explode(":", $data[0]);
			$d = trim($data[1]);
			
			$return = $p[0] . ": $d; ";
			$return .= "-webkit-".$p[0].": $d; ";
			$return .= "-moz-".$p[0].": $d; ";
			$return .= "-ms-".$p[0].": $d; ";
			$return .= "-o-".$p[0].": $d; ";
			
			return $return;
		}
		
		/*
			Function: geocodeAddress
				Returns a latitude and longitude for a given address.
				Caches results in a BigTree setting.
			
			Parameters:
				address - The address to geocode.
			
			Returns:
				An associative array with "lat" and "lon" keys.
		*/
		
		static function geocodeAddress($address) {
			global $cms,$admin;
			
			// Clean up the address and get our cache key
			$address = trim(strip_tags($address));
			$cache_key = base64_encode($address);
			
			// See if the setting exists, if it does grab it, otherwise create it.
			if (!$admin) {
				$admin = new BigTreeAdmin;
			}
			if (!$admin->settingExists("bigtree-internal-geocoded-addresses")) {
				$admin->createSetting(array("id" => "bigtree-internal-geocoded-addresses", "system" => "on"));
			}
			$cache = $cms->getSetting("bigtree-internal-geocoded-addresses");
			if (isset($cache[$cache_key])) {
				return $cache[$cache_key];
			}
			
			// It's not in the cache, ask Google for it.
			$file = utf8_encode(BigTree::curl("http://maps.google.com/maps/geo?q=".urlencode($address)."&output=xml"));
			try {
				$xml = new SimpleXMLElement($file);
				$coords = explode(",", $xml->Response->Placemark->Point->coordinates);
				$geo = array("latitude" => $coords[1], "longitude" => $coords[0]);
			} catch (Exception $e) {
				$geo = false;
			}
			
			// Add the result to the cache and return it.
			$cache[$cache_key] = $geo;
			$admin->updateSettingValue("bigtree-internal-geocoded-addresses",$cache);
			return $geo;
		}
		
		/*
			Function: getAvailableFileName
				Gets a web safe available file name in a given directory.
			
			Parameters:
				directory - The destination directory.
				file - The desired file name.
			
			Returns:
				An available, web safe file name.
		*/
		
		static function getAvailableFileName($directory,$file) {
			global $cms;
		
			$parts = self::pathInfo($directory.$file);
			
			// Clean up the file name
			$clean_name = $cms->urlify($parts["filename"]);
			if (strlen($clean_name) > 50) {
				$clean_name = substr($clean_name,0,50);
			}
			$file = $clean_name.".".strtolower($parts["extension"]);
			
			// Just find a good filename that isn't used now.
			$x = 2;
			while (file_exists($directory.$file)) {
				$file = $clean_name."-$x.".strtolower($parts["extension"]);
				$x++;
			}
			return $file;
		}
		
		/*
			Function: getFieldSelectOptions
				Get the <select> options of all the fields in a table.
			
			Parameters:
				table - The table to draw the fields for.
				default - The currently selected value.
				sorting - Whether to duplicate fields into "ASC" and "DESC" versions.
		*/
		
		static function getFieldSelectOptions($table,$default = "",$sorting = false) {
			$table_description = self::describeTable($table);
			if (!$table_description) {
				echo '<option>ERROR: Table Missing</option>';
				return;
			}
			echo '<option></option>';
			foreach ($table_description["columns"] as $col) {
				if ($sorting) {
					if ($default == $col["name"]." ASC" || $default == "`".$col["name"]."` ASC") {
						echo '<option selected="selected">`'.$col["name"].'` ASC</option>';
					} else {
						echo '<option>`'.$col["name"].'` ASC</option>';
					}
					
					if ($default == $col["name"]." DESC" || $default == "`".$col["name"]."` DESC") {
						echo '<option selected="selected">`'.$col["name"].'` DESC</option>';
					} else {
						echo '<option>`'.$col["name"].'` DESC</option>';
					}
				} else {
					if ($default == $col["name"]) {
						echo '<option selected="selected">'.$col["name"].'</option>';
					} else {
						echo '<option>'.$col["name"].'</option>';
					}
				}
			}
		}
		
		/*
			Function: getTableSelectOptions
				Get the <select> options for all of tables in the database excluding bigtree_ prefixed tables.
			
			Parameters:
				default - The currently selected value.
		*/
		
		static function getTableSelectOptions($default = false) {
			global $bigtree;
			
			$q = sqlquery("SHOW TABLES");
			while ($f = sqlfetch($q)) {
				$tname = $f["Tables_in_".$bigtree["config"]["db"]["name"]];
				if (isset($bigtree["config"]["show_all_tables_in_dropdowns"]) || ((substr($tname,0,8) !== "bigtree_"))) {
					if ($default == $f["Tables_in_".$bigtree["config"]["db"]["name"]]) {
						echo '<option selected="selected">'.$f["Tables_in_".$bigtree["config"]["db"]["name"]].'</option>';
					} else {
						echo '<option>'.$f["Tables_in_".$bigtree["config"]["db"]["name"]].'</option>';
					}
				}
			}
		}
		
		/*
			Function: getThumbnailSizes
				Returns a list of sizes of an image and the result sizes.
			
			Parameters:
				file - The location of the image to crop.
				maxwidth - The maximum width of the new image (0 for no max).
				maxheight - The maximum height of the new image (0 for no max).
			
			Returns:
				An array with (type,width,height,result width,result height)
		*/
		
		static function getThumbnailSizes($file,$maxwidth,$maxheight) {
			global $bigtree;
			
			list($w, $h, $type) = getimagesize($file);
			if ($w > $maxwidth && $maxwidth) {
				$perc = $maxwidth / $w;
				$result_width = $maxwidth;
				$result_height = round($h * $perc,0);
				if ($result_height > $maxheight && $maxheight) {
					$perc = $maxheight / $result_height;
					$result_height = $maxheight;
					$result_width = round($result_width * $perc,0);
				}
			} elseif ($h > $maxheight && $maxheight) {
				$perc = $maxheight / $h;
				$result_height = $maxheight;
				$result_width = round($w * $perc,0);
				if ($result_width > $maxwidth && $maxwidth) {
					$perc = $maxwidth / $result_width;
					$result_width = $maxwidth;
					$result_height = round($result_height * $perc,0);
				}
			} else {
				$result_width = $w;
				$result_height = $h;
			}
			
			return array($type,$w,$h,$result_width,$result_height);
		}
		
		/*
			Function: globalizeArray
				Globalizes all the keys of an array into global variables without compromising $_ variables.
				Runs an array of functions on values that aren't arrays.
			
			Parameters:
				array - An array with key/value pairs.
				non_array_functions - An array of functions to perform on values that aren't arrays.
			
			See Also:
				<globalizeGETVars>
				<globalizePOSTVars>
		*/
		
		static function globalizeArray($array,$non_array_functions = array()) {
			if (is_array($array)) {
				foreach ($array as $key => $val) {
					if (strpos($key,0,1) != "_") {
						global $$key;
						if (is_array($val)) {
							$$key = $val;
						} else {
							foreach ($non_array_functions as $func) {
								$val = $func($val);
							}
							$$key = $val;
						}
					}
				}
				
				return true;
			}
			return false;
		}
		
		/*
			Function: globalizeGETVars
				Globalizes all the $_GET variables without compromising $_ variables.
				Runs an array of functions on values that aren't arrays.
			
			Parameters:
				non_array_functions - An array of functions to perform on values that aren't arrays.
			
			See Also:
				<globalizeArray>
				<globalizePOSTVars>
				
		*/
		
		static function globalizeGETVars($non_array_functions = array()) {
			foreach ($_GET as $key => $val) {
				if (strpos($key,0,1) != "_") {
					global $$key;
					if (is_array($val)) {
						$$key = $val;
					} else {
						foreach ($non_array_functions as $func) {
							$val = $func($val);
						}
						$$key = $val;
					}
				}
			}
		}
		
		/*
			Function: globalizePOSTVars
				Globalizes all the $_POST variables without compromising $_ variables.
				Runs an array of functions on values that aren't arrays.
			
			Parameters:
				non_array_functions - An array of functions to perform on values that aren't arrays.
			
			See Also:
				<globalizeArray>
				<globalizeGETVars>
		*/
		
		static function globalizePOSTVars($non_array_functions = array()) {
			foreach ($_POST as $key => $val) {
				if (strpos($key,0,1) != "_") {
					global $$key;
					if (is_array($val)) {
						$$key = $val;
					} else {
						foreach ($non_array_functions as $func) {
							$val = $func($val);
						}
						$$key = $val;
					}
				}
			}
		}
		
		/*
			Function: gravatar
				Returns a properly formatted gravatar url.
			
			Parameters:
				email - User's email address.
				size - Image size; defaults to 56
				default - Default profile image; defaults to BigTree icon
				rating - Defaults to "pg"
		*/
		
		static function gravatar($email = "", $size = 56, $default = false, $rating = "pg") {
			if (!$default) {
				$default = "http://www.bigtreecms.org/images/bigtree-gravatar.png";
			}
			return "http://www.gravatar.com/avatar/" . md5(strtolower($email)) . "?s=" . $size . "&d=" . urlencode($default) . "&rating=" . $rating;
		}
		
		
		
		/*
			Function: isDirectoryWritable
				Extend's PHP's is_writable to support directories that don't exist yet.
			
			Parameters:
				path - The path to check the writable status of.
			
			Returns:
				true if the directory exists and is writable or could be created, otherwise false.
		*/
		static function isDirectoryWritable($path) {
			if (is_writable($path)) {
				return true;
			}
			$parts = explode("/",ltrim($path,"/"));
			unset($parts[count($parts)-1]);
			$path = "/".implode("/",$parts);
			if (!is_dir($path)) {
				return self::isDirectoryWritable($path);
			}
			return is_writable($path);
		}
		
		/*
			Function: makeDirectory
				Makes a directory (and all applicable parent directories).
				Sets permissions to 777.
			
			Parameters:
				directory - The full path to the directory to be made.
		*/
		
		static function makeDirectory($directory) {
			$dir_parts = explode("/",trim($directory,"/"));
			
			$dpath = "/";
			foreach ($dir_parts as $d) {
				$dpath .= $d;
				// Silence situations with open_basedir restrictions.
				if (!@file_exists($dpath)) {
					@mkdir($dpath);
					@chmod($dpath,0777);
				}
				$dpath .= "/";
			}
		}
		
		/*
			Function: moveFile
				Moves a file into a directory, even if that directory doesn't exist yet.
			
			Parameters:
				from - The current location of the file.
				to - The location of the new copy.
			
			Returns:
				true if the move was successful, false if the directories were not writable.
		*/
		
		static function moveFile($from,$to) {
			$success = self::copyFile($from,$to);
			if (!$success) {
				return false;
			}
			unlink($from);
			return true;
		}

		/*
			Function: nextSQLColumnDefinition
				Return the next SQL name definition from a string.

			Parameters:
				string - A string with the name definition being terminated by a single `

			Returns:
				A string.
		*/
				
		static function nextSQLColumnDefinition($string) {
			$key_name = "";
			$i = 0;
			$found_key = false;
			// Apparently we can have a backtick ` in a column name... ugh.
			while (!$found_key && $i < strlen($string)) {
				$char = substr($string,$i,1);
				$second_char = substr($string,$i + 1,1);
				if ($char != "`" || $second_char == "`") {
					$key_name .= $char;
					if ($char == "`") { // Skip the next one, this was just an escape character.
						$i++;
					}
				} else {
					$found_key = true;
				}
				$i++;
			}
			return $key_name;
		}
		
		/*
			Function: path
				Get the proper path for a file based on whether a custom override exists.
			
			Parameters:
				file - File path relative to either core/ or custom/
			
			Returns:
				Hard file path to a custom/ (preferred) or core/ file depending on what exists.
		*/
		
		static function path($file) {
			if (file_exists(SERVER_ROOT."custom/".$file)) {
				return SERVER_ROOT."custom/".$file;
			} else {
				return SERVER_ROOT."core/".$file;
			}
		}
		
		/*
			Function: pathInfo
				Wrapper for PHP's pathinfo to make sure it supports returning "filename"
			
			Parameters:
				file - The full file path.
			
			Returns:
				Everything PHP's pathinfo() returns (with "filename" even when PHP doesn't support it).
			
			See Also:
				<http://php.net/manual/en/function.pathinfo.php>
		*/
		
		static function pathInfo($file) {
			$parts = pathinfo($file);
			if (!defined('PATHINFO_FILENAME')) {
				$parts["filename"] = substr($parts["basename"],0,strrpos($parts["basename"],'.'));
			}
			return $parts;
		}
		
		/*
			Function: prefixFile
				Prefixes a file name with a given prefix.
			
			Parameters:
				file - A file name or full file path.
				prefix - The prefix for the file name.
			
			Returns:
				The full path or file name with a prefix appended to the file name.
		*/
		
		static function prefixFile($file,$prefix) {
			$pinfo = self::pathInfo($file);
			// Remove notices
			$pinfo["dirname"] = isset($pinfo["dirname"]) ? $pinfo["dirname"] : "";
			return $pinfo["dirname"]."/".$prefix.$pinfo["basename"];
		}
		
		/*
			Function: putFile
				Writes data to a file, even if that directory for the file doesn't exist yet.
				Sets the file permissions to 777 if the file did not exist.
			
			Parameters:
				file - The location of the file.
				contents - The data to write.
			
			Returns:
				true if the move was successful, false if the directories were not writable.
		*/
		
		static function putFile($file,$contents) {
			if (!self::isDirectoryWritable($to)) {
				return false;
			}
			if (!is_readable($from)) {
				return false;
			}
			
			$pathinfo = self::pathInfo($to);
			$file_name = $pathinfo["basename"];
			$directory = $pathinfo["dirname"];
			BigTree::makeDirectory($directory);
			
			if (!file_exists($file)) {
				file_put_contents($file,$contents);
				chmod($file,0777);
			} else {
				file_put_contents($file,$contents);
			}
			
			return true;
		}
		
		/*
			Function: placeholderImage
			
			Parameters:
				width - The width of desired image
				height - The height of desired image
				bg_color - The background color; must be full 6 charachter hex value
				text_color - The text color; must be full 6 charachter hex value
				icon_path - Image to render, relative to 'site/'; disables text rendering
				text_string - Text to render; overrides default dimension display
				
			Returns:
				Nothing; Renders a placeholder image
		*/
		
		static function placeholderImage($width, $height, $bg_color = false, $text_color = false, $icon_path = false, $text_string = false) {
			// Check size
			$width = ($width > 2000) ? 2000 : $width;
			$height = ($height > 2000) ? 2000 : $height;
			
			// Check colors
			$bg_color = (!$bg_color && $bg_color != "000" && $bg_color != "000000") ? "CCCCCC" : ltrim($bg_color,"#");
			$text_color = (!$text_color  && $text_color != "000" && $text_color != "000000") ? "666666" : ltrim($text_color,"#");
			
			// Set text
			$text = $text_string;
			if ($icon_path) {
				$text = "";
			} else {
				if (!$text_string) {
					$text = $width . " X " . $height;
				}
			}
			
			// Create image
			$image = imagecreatetruecolor($width, $height);
			// Build rgba from hex
			$bg_color = imagecolorallocate($image, base_convert(substr($bg_color, 0, 2), 16, 10), base_convert(substr($bg_color, 2, 2), 16, 10), base_convert(substr($bg_color, 4, 2), 16, 10));
			$text_color = imagecolorallocate($image, base_convert(substr($text_color, 0, 2), 16, 10), base_convert(substr($text_color, 2, 2), 16, 10), base_convert(substr($text_color, 4, 2), 16, 10));
			// Fill image
			imagefill($image, 0, 0, $bg_color); 
			
			// Add icon if provided
			if ($icon_path) {
				$icon_size = getimagesize($icon_path);
				$icon_width = $icon_size[0];
				$icon_height = $icon_size[1];
				$icon_x = ($width - $icon_width) / 2;
				$icon_y = ($height - $icon_height) / 2;
				
				$icon = imagecreatefrompng($icon_path); 
				imagesavealpha($icon, true);
				imagealphablending($icon, true);
				imagecopyresampled($image, $icon, $icon_x, $icon_y, 0, 0, $icon_width, $icon_height, $icon_width, $icon_height);
			// Add text if provided or default to size
			} elseif ($text) {
				$font = BigTree::path("inc/lib/fonts/arial.ttf");
				$fontsize = ($width > $height) ? ($height / 15) : ($width / 15);
				$textpos = imageTTFBbox($fontsize, 0, $font, $text); 
				imagettftext($image, $fontsize, 0, (($width - $textpos[2]) / 2), (($height - $textpos[5]) / 2), $text_color, $font, $text);
			}
		
			// Serve image and die
			header("Content-Type: image/png"); 
			imagepng($image);   
			imagedestroy($image);
			die();
		}
		
		/*
			Function: randomString
				Returns a random string.
			
			Parameters:
				length - The number of characters to return.
				seeds - The seed set to use ("alpha" for lowercase letters, "numeric" for numbers, "alphanum" for uppercase letters and numbers, "hexidec" for hexidecimal)
			
			Returns:
				A random string.
		*/
		
		static function randomString($length = 8, $seeds = 'alphanum') {
			// Possible seeds
			$seedings['alpha'] = 'abcdefghijklmnopqrstuvwqyz';
			$seedings['numeric'] = '0123456789';
			$seedings['alphanum'] = 'ABCDEFGHJKLMNPQRTUVWXY0123456789';
			$seedings['hexidec'] = '0123456789abcdef';
		
			// Choose seed
			if (isset($seedings[$seeds])) {
				$seeds = $seedings[$seeds];
			}
		
			// Seed generator
			list($usec, $sec) = explode(' ', microtime());
			$seed = (float) $sec + ((float) $usec * 100000);
			mt_srand($seed);
		
			// Generate
			$str = '';
			$seeds_count = strlen($seeds);
			for ($i = 0; $length > $i; $i++) {
				$str .= $seeds { mt_rand(0, $seeds_count - 1) };
			}
			return $str;
		}
		
		/*
			Function: redirect
				Simple URL redirect via header with proper code #
			
			Parameters:
				url - The URL to redirect to.
				code - The status code of redirect, defaults to normal 302 redirect.
		*/
		
		static function redirect($url = false, $codes = array("302")) {
			global $status_codes;
			if (!$url) {
				return false;
			}
			if (!is_array($codes)) {
				$codes = array($codes);
			}
			foreach ($codes as $code) {
				if ($status_codes[$code]) {
					header($_SERVER["SERVER_PROTOCOL"]." $code ".$status_codes[$code]);
				}
			}
			header("Location: ".$url);
			die();
		}

		/*
			Function: route
				Returns the proper file to include based on existence of subdirectories or .php files with given route names.
				Used by the CMS for routing ajax and modules.

			Parameters:
				directory - Root directory to begin looking in.
				path - An array of routes.

			Returns:
				An array with the first element being the file to include and the second element being an array containing extraneous routes from the end of the path.
		*/

		static function route($directory,$path) {
			$commands = array();
			$inc_file = $directory;
			$inc_dir = $directory;
			$ended = false;
			$found_file = false;
			foreach ($path as $piece) {
				// We're done, everything is a command now.
				if ($ended) {
					$commands[] = $piece;
				// Keep looking for directories.
				} elseif (is_dir($inc_dir.$piece)) {
					$inc_file .= $piece."/";
					$inc_dir .= $piece."/";
				// File exists, we're ending now.
				} elseif (file_exists($inc_file.$piece.".php")) {
					$inc_file .= $piece.".php";
					$ended = true;
					$found_file = true;
				// Couldn't find a file or directory.
				} else {
					$commands[] = $piece;
					$ended = true;
				}
			}

			if (!$found_file) {
				// If we have default in the routed directory, use it.
				if (file_exists($inc_dir."default.php")) {
					$inc_file = $inc_dir."default.php";
				// See if we can change the directory name into .php file in case the directory is empty but we have .php
				} elseif (file_exists(rtrim($inc_dir,"/").".php")) {
					$inc_file = rtrim($inc_dir,"/").".php";
				// We couldn't route anywhere apparently.
				} else {
					return array(false,false);
				}
			}
			return array($inc_file,$commands);
		}

		/*
			Function: tableExists
				Determines whether a SQL table exists.

			Parameters:
				table - The table name.

			Returns:
				true if table exists, otherwise false.
		*/

		static function tableExists($table) {
			$r = sqlrows(sqlquery("SHOW TABLES LIKE '".sqlescape($table)."'"));
			if ($r) {
				return true;
			}
			return false;
		}
		/*
			Function: touchFile
				touch()s a file even if the directory for it doesn't exist yet.
			
			Parameters:
				file - The file path to touch.
		*/
		
		static function touchFile($file) {
			if (!self::isDirectoryWritable($file)) {
				return false;
			}
			$pathinfo = self::pathInfo($file);
			$file_name = $pathinfo["basename"];
			$directory = $pathinfo["dirname"];
			$dir_parts = explode("/",ltrim($directory,"/"));
		
			$dpath = "/";
			foreach ($dir_parts as $d) {
				$dpath .= $d;
				if (!file_exists($dpath)) {
					mkdir($dpath);
					chmod($dpath,0777);
				}
				$dpath .= "/";
			}
		
			touch($file);
			chmod($file,0777);
			return true;
		}
		
		/*
			Function: translateArray
				Steps through an array and creates internal page links for all parts of it.
				Requires $admin to be presently instantiated to BigTreeAdmin.
			
			Parameters:
				array - The array to process.
			
			Returns:
				An array with internal page links encoded.
			
			See Also:
				<untranslateArray>
		*/
		
		static function translateArray($array) {
			global $admin;
			foreach ($array as &$piece) {
				if (is_array($piece)) {
					$piece = self::translateArray($piece);
				} else {
					$piece = $admin->autoIPL($piece);
				}
			}
			return $array;
		}
		
		/*
			Function: trimLength
				A smarter version of trim that works with HTML.
			
			Parameters:
				string - A string of text or HTML.
				length - The number of characters to trim to.
			
			Returns:
				A string trimmed to the proper number of characters.
		*/
		
		static function trimLength($string,$length) {
			$ns = "";
			$opentags = array();
			$string = trim($string);
			if (strlen(html_entity_decode(strip_tags($string))) < $length) {
				return $string;
			}
			if (strpos($string," ") === false && strlen(html_entity_decode(strip_tags($string))) > $length) {
				return substr($string,0,$length)."...";
			}
			$x = 0;
			$z = 0;
			while ($z < $length && $x <= strlen($string)) {
				$char = substr($string,$x,1);
				$ns .= $char;		// Add the character to the new string.
				if ($char == "<") {
					// Get the full tag -- but compensate for bad html to prevent endless loops.
					$tag = "";
					while ($char != ">"	 && $char !== false) {
						$x++;
						$char = substr($string,$x,1);
						$tag .= $char;
					}
					$ns .= $tag;
		
					$tagexp = explode(" ",trim($tag));
					$tagname = str_replace(">","",$tagexp[0]);
		
					// If it's a self contained <br /> tag or similar, don't add it to open tags.
					if ($tagexp[1] != "/" && $tagexp[1] != "/>") {
						// See if we're opening or closing a tag.
						if (substr($tagname,0,1) == "/") {
							$tagname = str_replace("/","",$tagname);
							// We're closing the tag. Kill the most recently opened aspect of the tag.
							$y = sizeof($opentags);
							$done = false;
							reset($opentags);
							while (current($opentags) && !$done) {
								if (current($opentags) == $tagname) {
									unset($opentags[key($opentags)]);
									$done = true;
								}
								next($opentags);
							}
						} else {
							// Open a new tag.
							$opentags[] = $tagname;
						}
					}
				} elseif ($char == "&") {
					$entity = "";
					while ($char != ";" && $char != " " && $char != "<") {
						$x++;
						$char = substr($string,$x,1);
						$entity .= $char;
					}
					if ($char == ";") {
						$z++;
						$ns .= $entity;
					} elseif ($char == " ") {
						$z += strlen($entity);
						$ns .= $entity;
					} else {
						$z += strlen($entity);
						$ns .= substr($entity,0,-1);
						$x -= 2;
					}
				} else {
					$z++;
				}
				$x++;
			}
			while ($x < strlen($string) && !in_array(substr($string,$x,1),array(" ","!",".",",","<","&"))) {
				$ns .= substr($string,$x,1);
				$x++;
			}
			$ns.= "...";
			$opentags = array_reverse($opentags);
			foreach ($opentags as $key => $val) {
				$ns .= "</".$val.">";
			}
			return $ns;
		}
		
		/*
			Function: unformatBytes
				Formats a string of kilobytes / megabytes / gigabytes back into bytes.
			
			Parameters:
				size - The string of (kilo/mega/giga)bytes.
			
			Returns:
				The number of bytes.
		*/
		
		static function unformatBytes($size) {
			$type = substr($size,-1,1);
			$num = substr($size,0,-1);
			if ($type == "M") {
				return $num * 1048576;
			} elseif ($type == "K") {
				return $num * 1024;
			} elseif ($type == "G") {
				return ($num * 1024 * 1024 * 1024);
			}
			return 0;
		}
		
		/*
			Function: untranslateArray
				Steps through an array and creates hard links for all internal page links.
			
			Parameters:
				array - The array to process.
			
			Returns:
				An array with internal page links decoded.
			
			See Also:
				<translateArray>
		*/
		
		static function untranslateArray($array) {
			global $cms;
			foreach ($array as &$piece) {
				if (is_array($piece)) {
					$piece = self::untranslateArray($piece);
				} else {
					$piece = $cms->replaceInternalPageLinks($piece);
				}
			}
			return $array;
		}
		
		/*
			Function: unzip
				Unzips a file.
			
			Parameters:
				file - Location of the file to unzip
				destination - The full path to unzip the file's contents to.
		*/
		
		static function unzip($file,$destination) {
			// If we can't write the output directory, we're not getting anywhere.
			if (!BigTree::isDirectoryWritable($destination)) {
				return false;
			}

			// Up the memory limit for the unzip.
			ini_set("memory_limit","512M");
			
			$destination = rtrim($destination)."/";
			BigTree::makeDirectory($destination);
			
			// If we have the built in ZipArchive extension, use that.
			if (class_exists("ZipArchive")) {
				$z = new ZipArchive;
				
				if (!$z->open($file)) {
					// Bad zip file.
					return false;
				}
				
				for ($i = 0; $i < $z->numFiles; $i++) {
					if (!$info = $z->statIndex($i)) {
						// Unzipping the file failed for some reason.
						return false;
					}
					
					// If it's a directory, ignore it. We'll create them in putFile.
					if (substr($info["name"],-1) == "/") {
						continue;
					}
					
					// Ignore __MACOSX and all it's files.
					if (substr($info["name"],0,9) == "__MACOSX/") {
						continue;
					}

					$content = $z->getFromIndex($i);
					if ($content === false) {
						// File extraction failed.
						return false;
					}
					BigTree::putFile($destination.$file["name"],$content);
				}
				
				$z->close();
				return true;

			// Fall back on PclZip if we don't have the "native" version.
			} else {
				// WordPress claims this could be an issue, so we'll make sure multibyte encoding isn't overloaded.
				if (ini_get('mbstring.func_overload') && function_exists('mb_internal_encoding')) {
					$previous_encoding = mb_internal_encoding();
					mb_internal_encoding('ISO-8859-1');
				}
				
				$z = new PclZip($file);
				$archive = $z->extract(PCLZIP_OPT_EXTRACT_AS_STRING);

				// If we saved a previous encoding, reset it now.
				if (isset($previous_encoding)) {
					mb_internal_encoding($previous_encoding);
					unset($previous_encoding);
				}
				
				// If it's not an array, it's not a good zip. Also, if it's empty it's not a good zip.
				if (!is_array($archive) || !count($archive)) {
					return false;
				}

				foreach ($archive as $item) {
					// If it's a directory, ignore it. We'll create them in putFile.
					if ($item["folder"]) {
						continue;
					}
					
					// Ignore __MACOSX and all it's files.
					if (substr($item["filename"],0,9) == "__MACOSX/") {
						continue;
					}
					
					BigTree::putFile($directory.$item["filename"],$item["content"]);
				}
				
				return true;
			}
		}
		
		/*
			Function: uploadMaxFileSize
				Returns Apache's max file size value for use in forms.
		
			Returns:
				The integer value for setting a form's MAX_FILE_SIZE.
		*/
		
		static function uploadMaxFileSize() {
			$upload_max_filesize = ini_get("upload_max_filesize");
			if (!is_integer($upload_max_filesize)) {
				$upload_max_filesize = self::unformatBytes($upload_max_filesize);
			}
			
			$post_max_size = ini_get("post_max_size");
			if (!is_integer($post_max_size)) {
				$post_max_size = self::unformatBytes($post_max_size);
			}
			
			if ($post_max_size < $upload_max_filesize) {
				$upload_max_filesize = $post_max_size;
			}
			
			return $upload_max_filesize;
		}
		
	}

	// For servers that don't have multibyte string extensions…
	if (!function_exists("mb_strlen")) {
		function mb_strlen($string) { return strlen($string); }
	}
	if (!function_exists("mb_strtolower")) {
		function mb_strtolower($string) { return strtolower($string); }
	}

	$state_list = array('AL'=>"Alabama",'AK'=>"Alaska",'AZ'=>"Arizona",'AR'=>"Arkansas",'CA'=>"California",'CO'=>"Colorado",'CT'=>"Connecticut",'DE'=>"Delaware",'DC'=>"District Of Columbia", 'FL'=>"Florida",'GA'=>"Georgia",'HI'=>"Hawaii",'ID'=>"Idaho",'IL'=>"Illinois",'IN'=>"Indiana",'IA'=>"Iowa",'KS'=>"Kansas",'KY'=>"Kentucky",'LA'=>"Louisiana",'ME'=>"Maine",'MD'=>"Maryland",'MA'=>"Massachusetts",'MI'=>"Michigan",'MN'=>"Minnesota",'MS'=>"Mississippi",'MO'=>"Missouri",'MT'=>"Montana",'NE'=>"Nebraska",'NV'=>"Nevada",'NH'=>"New Hampshire",'NJ'=>"New Jersey",'NM'=>"New Mexico",'NY'=>"New York",'NC'=>"North Carolina",'ND'=>"North Dakota",'OH'=>"Ohio",'OK'=>"Oklahoma",'OR'=>"Oregon",'PA'=>"Pennsylvania",'RI'=>"Rhode Island",'SC'=>"South Carolina",'SD'=>"South Dakota",'TN'=>"Tennessee",'TX'=>"Texas",'UT'=>"Utah",'VT'=>"Vermont",'VA'=>"Virginia",'WA'=>"Washington",'WV'=>"West Virginia",'WI'=>"Wisconsin",'WY'=>"Wyoming");

	$country_list = array("United States","Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombi","Comoros","Congo (Brazzaville)","Congo","Costa Rica","Cote d'Ivoire","Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","East Timor (Timor Timur)","Ecuador","Egypt","El Salvador","Equatorial Guinea","Eritrea","Estonia","Ethiopia","Fiji","Finland","France","Gabon","Gambia, The","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Korea, North","Korea, South","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Macedonia","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova","Monaco","Mongolia","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepa","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","Norway","Oman","Pakistan","Palau","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal","Serbia and Montenegro","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","Spain","Sri Lanka","Sudan","Suriname","Swaziland","Sweden","Switzerland","Syria","Taiwan","Tajikistan","Tanzania","Thailand","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu","Uganda","Ukraine","United Arab Emirates","United Kingdom","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela","Vietnam","Yemen","Zambia","Zimbabwe");

	$month_list = array("1" => "January","2" => "February","3" => "March","4" => "April","5" => "May","6" => "June","7" => "July","8" => "August","9" => "September","10" => "October","11" => "November","12" => "December");
	
	$status_codes = array(
		"200" => "OK",
		"300" => "Multiple Choices",
		"301" => "Moved Permanently",
		"302" => "Found",
		"304" => "Not Modified",
		"307" => "Temporary Redirect",
		"400" => "Bad Request",
		"401" => "Unauthorized",
		"403" => "Forbidden",
		"404" => "Not Found",
		"410" => "Gone",
		"500" => "Internal Server Error",
		"501" => "Not Implemented",
		"503" => "Service Unavailable",
		"550" => "Permission denied"
	);
	
?>