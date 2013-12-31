///响应开始(用来检测媒体文件地址大小等信息)
var mediaurls=[];//示例:mediaurls["tabid6"]=[{name:"aa",url:"sd",size:"0.12MB"},{name:"bb",url:"sdf",size:"1.32MB"}];
var hasm3u8 = ["false"];
var currenDeviceIndex=-1;
chrome.webRequest.onResponseStarted.addListener(
function(data){
	//console.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@");	
    findMedia(data);
},
{urls: ["http://*/*", "https://*/*"],types: ["object","other"]},
["responseHeaders"]);

const exts=["flv","hlv","f4v","mp4","mp3","wma","m3u8"];//检测的后缀

function findMedia(data){
	var id="tabid"+data.tabId;//记录当前请求所属标签的id
	if(data.tabId==-1)//不是标签的请求则返回
		return;	
	chrome.browserAction.setBadgeText({text:device_list.length.toString(),tabId:data.tabId});//数字提示设备个数	
	if (hasm3u8[id]=='true')
	    return; //找到一个就够了	
	var size = getHeaderValue("content-length", data);
	if (!size)
		return;
	
	if (size<102400)//媒体文件最小大小(100KB)
		return;
	
	var str = data.url.split("?");//url按？分开
	str = str[0].split( "/" );//按/分开
	var name=str[str.length-1].toLowerCase();//得到带后缀的名字
	str=name.split(".");
	var ext = str[str.length-1].toLowerCase();
	var contentType = getHeaderValue("content-type", data).toLowerCase();
	if( ext=='swf')
	{
		return;
	}
	
	if (contentType && contentType!="application/x-shockwave-flash") 
	{
		var type = contentType.split("/")[0];
		//此处用contentType和文件后缀类型来判断(防止像letv网这样以.letv结尾的后缀,所以此处不单单检查后缀)
	//console.log("@@@"+type );			
		if (type!="video" && type!="audio" && exts.indexOf(ext)== -1)
		{
			var res=testContent(data);//最后再判断下Content-Disposition内容
			if(res==null)//没有附件内容，返回
				return;
			else
				name=res;//得到文件名
		}
	}

	var url = data.url;
	var dealurl=url.replace(/(fs|start|begin)=[0-9]+/g,"").replace(/\?$/,"");//去掉url中开始时间的参数

	if(mediaurls[id]==undefined)
		mediaurls[id]=[];

	for (var i = 0; i<mediaurls[id].length; i++) {
		var existUrl=mediaurls[id][i].url.replace(/(fs|start|begin)=[0-9]+/g,"").replace(/\?$/,"");//去掉url中开始时间的参数
		if(existUrl==dealurl)//如果已有相同url则不重复记录
			return;
	}
 	updateDeviceList();			
	size=Math.round( 100 * size / 1024 / 1024 ) / 100 +"MB";
	var info={name:name,url:url,size:size};
	mediaurls[id].push(info);
	console.log("@@@"+id+" "+size+" "+url);
	console.log("@@@"+data);
	if(mediaurls[id])//开启媒体探测和显示资源数功能
	{
	//	chrome.browserAction.setBadgeText({text:mediaurls[id].length.toString(),tabId:data.tabId});//数字提示
		chrome.browserAction.setTitle({title:"探测到"+mediaurls[id].length.toString()+"个媒体资源",tabId:data.tabId});//文字提示
		chrome.browserAction.setIcon({path: "19_1.png"});
        chrome.browserAction.setPopup({'popup':'./popup.html'});
		
	}
}

function testContent(data)
{
	var str = getHeaderValue('Content-Disposition', data);
	if (!str)
		return null;
	var res = str.match(/^(inline|attachment);\s*filename="?(.*?)"?\s*;?$/i);//匹配attachment;filename=...这样字串
	if (!res)//未能匹配
		return null;
	
	try{
		var name=decodeURIComponent(res[2]);
		return name;//返回解码后的filename名称
	}
	catch(e) {
	}
	return res[2];//解码失败直接返回编码的名字
}

function getHeaderValue(name, data){
	name = name.toLowerCase();
	for (var i = 0; i<data.responseHeaders.length; i++) {
		if (data.responseHeaders[i].name.toLowerCase() == name) {
			return data.responseHeaders[i].value;
		}
	}
	return null;
}

///标签更新，清除该标签之前记录
function createHttpRequest() {
	if (window.XMLHttpRequest) {
		xmlHttp = new XMLHttpRequest();
		if (xmlHttp.overrideMimeType) {
			xmlHttp.overrideMimeType('text/xml');
		}
	} else if (window.ActiveXObject) {
		try {
			xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
    			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
    			//No operation
			}
		}
	}
	return xmlHttp;
}


function setPopup()
{
	console.log("list length "+device_list.length);	

	if (device_list.length==1)
	{
	    currenDeviceIndex = 0;
//        chrome.browserAction.setPopup({'popup':''});

	}
	else
	{
        chrome.browserAction.setPopup({'popup':'./popup.html'});
	}
	
}


function addUrl(tabid,title,url,size)
{
	var tid="tabid"+tabid;
	hasm3u8[tid] = "true";
	
	var info={name:title,url:url,size:size};
	
	if(mediaurls[tid]==undefined)
		mediaurls[tid]=[];
    console.log("Name=> "+title);	
	chrome.browserAction.setIcon({path: "19_1.png"})				    
		//chrome.browserAction.setPopup({'popup':'./popup.html'});	
	//for (var i = 0; i<mediaurls[tid].length; i++) {
	//	var existUrl=mediaurls[tid][i].url;
	//	if(existUrl==url)//如果已有相同url则不重复记录
	//		mediaurls[tid][i].name = title; //更新名字，以新的为准
	//		return;
	//}											
	//mediaurls[tid].push(info);	
	mediaurls[tid][0]=info;
}

function getYouKuList(tabid,title,id) {
	xmlHttp = createHttpRequest();  
	var url = "http://m.youku.com/wireless_api3/videos/"+id+"/playurl?format=1,2,4,5,6";
	console.log("url=> "+url);	
	var mp4url = "http://v.youku.com/player/getRealM3U8/vid/"+id+"/type/mp4/v.m3u8"
	addUrl(tabid,title,mp4url,0)//先添加一个保底的，如果有更清晰用更清晰的替换之
	//xmlHttp.setRequestHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
	function handleStateChange()
	{   
	    if(xmlHttp.readyState == 4)
	    {       
	        if (xmlHttp.status == 200 || xmlHttp.status == 0)
	        {
	            //var result = xmlHttp.responseText;
	            var result = JSON.parse(xmlHttp.responseText);
	            if (result.status!="failed")
	            {
		            
					//console.log("JSON=>"+result.results.m3u8_mp4);	
					//console.log("JSON=>"+result.results.m3u8_flv[0].url);	
					//console.log("JSON=>"+result.results.m3u8_hd[0].url);	
					//console.log("JSON=>"+result.results.m3u8_mp4[0].url);
                    var list;
					if (result.results.m3u8_hd != undefined)
					{
						list=result.results.m3u8_hd;
					}
					else 
					if (result.results.m3u8_mp4 != undefined)
					{
						list=result.results.m3u8_mp4;
					}
					else 
					if (result.results.m3u8_flv != undefined)
					{
						list=result.results.m3u8_flv;
					}
					console.log("JSON=>"+list[0].url);	

					var url = list[0].url;
					var size = list[0].size;
					size=Math.round( 100 * size / 1024 / 1024 ) / 100 +"MB";

					addUrl(tabid,title,url,size)

     										
				}
				else
				{
					
					var url = "http://v.youku.com/player/getRealM3U8/vid/"+id+"/type/mp4/v.m3u8"
					addUrl(tabid,title,url,0)
					console.log("Get Address fail,try "+url);	
				}
	           
	        }
	    }
	}	
	xmlHttp.onreadystatechange=handleStateChange;
	xmlHttp.open("GET", url, true);
	xmlHttp.send(null);
}



function getSohuList(tabid,title,url) {
	var vid;
	$.get(url,function(data){ 
	    console.log("get vid ");
	    var re=data.match(/var vid=\"(\d+)\"/i);
	    if (re)
	    {
		    vid = re[1];
		    console.log("vid is "+vid);
		    url = "http://hot.vrs.sohu.com/ipad"+vid+".m3u8";
		    size = 0;
		    addUrl(tabid,title,url,size)
	    }
	});

}


function getKu6List(tabid,title,url)
{
	var re = url.match(/.*?v.ku6.com\/.*?\/([^\/]+\.\.).html.*?/)
	var re1 = url.match(/.*?topic.ku6.com\/show-\d+-(.*?\.\.).html.*?/)

	if (re)
	{
	    console.log("get ku6 id"+ re[1]);		
		url = "http://v.ku6.com/fetchwebm/"+re[1]+".m3u8";
		addUrl(tabid,title,url,0)		
	}
	else if (re1)
	{
	    console.log("get ku6 id"+ re1[1]);		
		url = "http://v.ku6.com/fetchwebm/"+re1[1]+".m3u8";
		addUrl(tabid,title,url,0)		
	}
}


chrome.tabs.onUpdated.addListener( function( tabId, changeInfo ){
	if(changeInfo.status=="loading")//在载入之前清除之前记录
	{
		var id="tabid"+tabId;//记录当前请求所属标签的id
		device_list=[];		//清除设备列表	
		if(mediaurls[id])
		{
			mediaurls[id]=[];
			chrome.browserAction.setIcon({path: "19_2.png"});	
		}
            		
	}
	chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
		//console.log("###################################");	
		var res = tabs[0].url.match(/.*?v.youku.com\/v_show\/id_([^_]+).*?\.html/i);
		if (res)//匹配
		{
			console.log(tabs[0].title);
			console.log(tabs[0].url); 
			//var re_name = tabs[0].title.match(/(.*?)—.*?/i);
			str=tabs[0].title.split("—");
			console.log("title "+str[0]);
			
			var name = str[0];
			console.log("find youku"+res[1]);
				
  	 		updateDeviceList();			
			getYouKuList(tabId,name,res[1]); 
		}
		else if (tabs[0].url.match(/tv.sohu.com.*?\.shtml/i))
		{
			console.log(tabs[0].title);
			console.log(tabs[0].url); 
			console.log("It's Sohu Video"); 
  	 		updateDeviceList();					
			getSohuList(tabId,"Sohu",tabs[0].url); 
		}
		else if (tabs[0].url.match(/.*?.ku6.com.*?/i))  
		{
			console.log(tabs[0].url); 
			console.log("It's Ku6 Video"); 
  	 		updateDeviceList();					
			getKu6List(tabId,"Ku6",tabs[0].url); 
		}
		console.log("No Match"); 		
	});



} );

///标签关闭，清除该标签之前记录
chrome.tabs.onRemoved.addListener( function( tabId ){
	var id="tabid"+tabId;//记录当前请求所属标签的id
	if(mediaurls[id])
		delete mediaurls[id];
} );

chrome.tabs.onActivated.addListener(function(activeInfo) {
	var id="tabid"+activeInfo.tabId;//记录当前请求所属标签的id
	if(mediaurls[id])
	{
		chrome.browserAction.setIcon({path: "19_1.png"});	
	}
	else
	{
		chrome.browserAction.setIcon({path: "19_2.png"});
	}
	
});

chrome.browserAction.onClicked.addListener( function( tab ){
	var id="tabid"+tab.id;//记录当前请求所属标签的id
	console.log("onClick "+id.toString());	
	if (currenDeviceIndex!=-1)
	{
		if(mediaurls[id] && device_list[currenDeviceIndex].isPlaying==false)
		{
			onClickVideoPlay(mediaurls[id][0].name,mediaurls[id][0].url,device_list[currenDeviceIndex].ip);
			console.log("Name "+mediaurls[id][0].url+"ip "+device_list[currenDeviceIndex].ip);
			device_list[currenDeviceIndex].isPlaying = true;
		}

	}
} );


function createHttpRequest() {
	if (window.XMLHttpRequest) {
		xmlHttp = new XMLHttpRequest();
		if (xmlHttp.overrideMimeType) {
			xmlHttp.overrideMimeType('text/xml');
		}
	} else if (window.ActiveXObject) {
		try {
			xmlHttp = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
    			xmlHttp = new ActiveXObject("Microsoft.XMLHTTP");
			} catch (e) {
    			//No operation
			}
		}
	}
	return xmlHttp;
}

function onClickVideoPlay(name,media_url,ip) {
		xmlHttp = createHttpRequest();
		var url2 = ip+":6095/video/action=play&clientname=PC&url=" + encodeURIComponent(media_url)+"&name="+encodeURIComponent(name);
		xmlHttp.open("get", url2, true);
		xmlHttp.setRequestHeader("Content-Type", "text/json");
		xmlHttp.send();
		console.log("Send "+url2);	
}
function onClickVideoStop(name,media_url,ip) {
		xmlHttp = createHttpRequest();
		var url2 = ip+":6095/controller?action=keyEvent&keyCode=back";
		xmlHttp.open("get", url2, true);
		xmlHttp.setRequestHeader("Content-Type", "text/json");
		xmlHttp.send();
		console.log("Send "+url2);	
}

