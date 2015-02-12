/*
flatten_json_to_array

converts the json string to an array of json elements like the output below
Input => json object 
	eg., {
		"id":1,
		"url":"http:\/\/localhost\/omeka\/api\/collections\/1",
		"public":true,
		"featured":false,
		"added":"2014-10-04T03:01:07+00:00",
		"modified":"2014-11-15T08:23:40+00:00",
		"owner":{
			"id":1,
			"url":"http:\/\/localhost\/omeka\/api\/users\/1",
			"resource":"users"
		},
		"items":{
			"count":18,
			"url":"http:\/\/localhost\/omeka\/api\/items?collection=1",
			"resource":"items"
		},
Output => 
	eg., 	added: "2014-10-04T03:20:19+00:00"
		collection: Object
		collection.id: 1
		collection.resource: "collections"
		collection.url: "http://citrus-360.com/omeka/api/collections/1"
		element_texts: Array[7]
		element_texts[0]: Object
		element_texts[0].element: Object
		element_texts[0].element.id: 50
*/
function flatten_json_to_array(obj){
	var root = {};
	(function tree(obj, index){
		var suffix = toString.call(obj) == "[object Array]" ? "]" : "";
		for(var key in obj){
			if(!obj.hasOwnProperty(key))	continue;
			root[index+key+suffix] = obj[key];
			if( toString.call(obj[key]) == "[object Array]" )tree(obj[key],index+key+suffix+"[");
			if( toString.call(obj[key]) == "[object Object]" )tree(obj[key],index+key+suffix+".");   
		}
	})(obj,"");
	return root;
}
	
function get_collections() {
	$.when( $.ajax(map['si1']) ).done(function( json_list ) {
        var collection_name = "" ;
        var collection_id = "" ;
        var html_content = '<ul data-role="listview" data-inset="true">';
        var flat_array = flatten_json_to_array(json_list);
        for (i=0; i < json_list.length; i++) {
                collection_name = i + '].element_texts[0].text';
                collection_id = i + '].id';
                html_content += '<li class ="arrow"><a  data-param="'+flat_array[collection_id]+ '" href="s12.html">'  +  flat_array[collection_name]  + '</a></li>' ;
        }
        $('#page777').html(html_content);
        $("a").on("click", function (event){
        var data_param_value = $(this).attr("data-param");
        localStorage.setItem("ls_coll", data_param_value);
        });
});
}
/*
function get_items() {
	ifilter = localStorage.getItem("ls_coll");
	var items_url = map['s12_1'] + '?collection=' + ifilter;
	var files_url = map['s12_2'];
	$.when( $.ajax(items_url), $.ajax(files_url)).done(function( items_json, files_json ) {
	var items_list = items_json[0];
	var files_list = files_json[0];
	var html_content = "";
	html_content = '<ul class = "listview">'
	var flat_items = flatten_json_to_array(items_list);
	var flat_files = flatten_json_to_array(files_list);
	for (i=0; i<items_list.length; i++){
		var item_name = i + '].element_texts[0].text';
		var item_id = i + '].id';
		for (j=0;j<files_list.length; j++){
			var image_item_id = j +'].item.id';
			if ((flat_files[image_item_id] == flat_items[item_id])){
				var file_item_thumbnail = j + '].file_urls.thumbnail';
				html_content += '<li class ="arrow"><a data-param = "'+flat_items[item_id]+'"href="s13.html" target ="_blank">' + '<img src = ' + flat_files[file_item_thumbnail] +  '>' + '<br>' + '<p>' + flat_items[item_name] +'</p>'  + '</a></li>' ;
			}
		}
	}
	$('#page999').html(html_content);
	$("a").on("click", function (event){
        var data_param_value = $(this).attr("data-param");
        localStorage.setItem("item_id", data_param_value);
	});

});	
}
*/
function get_items() {
        ifilter = localStorage.getItem("ls_coll");
        var items_url = map['s12_1'] + '?collection=' + ifilter;
	console.log(items_url);
        $.when( $.ajax(items_url)).done(function(items_json) {
        var items_list = items_json;
        var html_content = "";
	var flat_files;
        var file_item_thumbnail ="";
        html_content = '<ul class = "listview">';
        var flat_items = flatten_json_to_array(items_list);
	console.log(items_list.length);
        for (i=0; i<items_list.length; i++) {
                var item_name = i + '].element_texts[0].text';
                var item_id = i + '].id';
	 	var files_url = map['s12_2'] + '?item=' + flat_items[item_id];
		$.ajax({url:files_url, type: "GET", async:false, success:function(files_json) {
			var files_list = files_json[0];
        		flat_files = flatten_json_to_array(files_list);
                        file_item_thumbnail = 'file_urls.thumbnail';
                	html_content += '<li class ="arrow"><a id="'+i+ '" dataparam = "' + flat_items[item_id] +  '" href="s13.html" target ="_blank">' + '<img src = ' + flat_files[file_item_thumbnail] +  '>' + '<br>' + '<p>' + flat_items[item_name] +'</p>'  + '</a></li>' ;
			item_name="";
			file_item_thumbnail="";
			}
		});
        	$('#page999').html(html_content);
        }
	$("a").on("click", function (event){
        var data_param_value = $(this).attr("dataparam");
        localStorage.setItem("item_id", data_param_value);
});
        });
}

function get_item_details() {
        var ifilter = localStorage.getItem("item_id");
	console.log(ifilter);
        var items_url = map['s12_1'] + '/' + ifilter;
	var files_url = map['s12_2'];
        $.when( $.ajax(items_url), $.ajax(files_url)).done(function( items_json, files_json ) {
        var items_list = items_json[0];
        var files_list = files_json[0];
        var html_content = "";
        var flat_items = flatten_json_to_array(items_list);
        var flat_files = flatten_json_to_array(files_list);
	var item_element_text = flat_items.element_texts;
	var item_title = flat_items.element_texts[0].text;
	var item_id = flat_items.id;
	for (j=0;j<files_list.length; j++) {
		var image_item_id = j + '].item.id';
		if (item_id == flat_files[image_item_id]) {
			var file_item_thumbnail = j + '].file_urls.thumbnail';
		}
	}
	//console.log(item_element_text);
	html_content += '<center><h1>' + item_title + '</h1></center>';
	html_content += '<center><img src = ' + flat_files[file_item_thumbnail] +  '></center><br>';
	for (i=0; i<item_element_text.length; i++) {
		if(item_element_text[i].element.name == 'Description') {
//			console.log(item_element_text[i].text);
			html_content += '<center><p align="justify">' + item_element_text[i].text + '</p></center>';
			
		}
	}
        $('#page999').html(html_content);
        });
        
}
