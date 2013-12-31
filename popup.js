	var BG = chrome.extension.getBackgroundPage();
	var tabtitle;//当前标签标题
	var curMediaurls;
	var isRefreshDeviceList=false;
	var refreshCount=0;
	var previousDeviceNum=0;
	chrome.windows.getCurrent(function(wnd){
		chrome.tabs.getSelected(wnd.id, function(tab){
			var id="tabid"+tab.id;
			tabtitle=tab.title;
			curMediaurls = BG.mediaurls[id];
			if (BG.device_list.length==1)
			{
			    currenDeviceIndex = 0;
				if (BG.device_list[currenDeviceIndex].ip!="")
				{
					if(BG.mediaurls[id])
					{
						onClickVideoPlay(BG.mediaurls[id][0].name,BG.mediaurls[id][0].url,BG.device_list[currenDeviceIndex].ip);
						BG.device_list[currenDeviceIndex].isPlaying = true;
						console.log("Only 1 device ,play Name "+BG.mediaurls[id][0].url+"ip "+BG.device_list[currenDeviceIndex].ip);	
					}
				}			    
			}				
			showDeviceList(BG.device_list,BG.mediaurls[id])
			//filltable(BG.mediaurls[id],true);//填充媒体探测表格
		
			setInterval(function(){
				if (isRefreshDeviceList && refreshCount <10)
				{
					refreshCount=refreshCount+1;
   					chrome.browserAction.setBadgeText({text:BG.device_list.length.toString(),tabId:tab.id});//数字提示设备个数										
					showDeviceList(BG.device_list,BG.mediaurls[id]);
				}
				else if (refreshCount >=10)
				{
					isRefreshDeviceList = false;
					refreshCount=0;
				}
			},1000);
		});
	});


	function selectDevice(index)
	{
		BG.currenDeviceIndex=index;
		console.log("index "+index);
		console.log("Set current Device IP is "+BG.device_list[BG.currenDeviceIndex].ip);
	}

	function showDeviceList(data,mediaurl)
	{
		var btnRefresh=document.getElementById("refresh");
		btnRefresh.addEventListener('click', function () {
			//BG.device_list=[];
			//document.getElementById("refresh").class="refresh1";		
			var empty=[];
			btnRefresh.disabled = true;
			btnRefresh.value = "查找设备中";
			showDeviceList(empty,null);	//清除列表			
			chrome.extension.getBackgroundPage().updateDeviceList();
			isRefreshDeviceList = true;
			//location.reload(force);
			setTimeout(function(){var btnRefresh=document.getElementById("refresh");btnRefresh.disabled = false;btnRefresh.value="刷新"},5000);
		    console.log("Set current Device IP is "+BG.device_list[BG.currenDeviceIndex].ip);
		},false);
		btnRefresh.addEventListener('mouseover', function(){var para = this.className = "refresh1"; });		
		btnRefresh.addEventListener('mouseout', function(){var para = this.className = "refresh"; });		
	 				
		if(data==undefined || data.length==0)
		{
			var mytable=document.all("devicelist");
			mytable.innerHTML = "";
			return;
		}		
		//if (previousDeviceNum<data.length)
		//{
	 //   	document.getElementById("refresh").class="refresh";
		//}
		//else
		//{
	 //   	document.getElementById("refresh").class="refresh1";
		//}


		var body=document.getElementById("body");
		//body.style.height=  (data.length+1)*40+"px";

		var mytable=document.all("devicelist");
		
		mytable.innerHTML = "";
		previousDeviceNum=data.length;
		for (var i = 0; i < data.length; i++) {
			var index=mytable.rows.length;
			var newrow = mytable.insertRow(index);
			newrow.name=i;
			
			//第一列
			var newcell= newrow.insertCell();
			//newcell.innerHTML="<input type=\"radio\" name=\""+i+"\" >";
			var status = data[i].ip.replace(/http:\/\//,'');
			if (BG.device_list[i].isPlaying==true)
			{
				status="播放中"
			}
			if (data[i].name.indexOf('盒子')>=0)
			{
				//newcell.innerHTML="<img src='Box.png' class=\"deviceIcon\"/>"
				newcell.innerHTML="<div class=\"testNormal\" id=\"items\" name=\""+i+"\">   <div style='float:left'><img src='Box.png' class=\"deviceIcon\"/></div> <div class='trText' style='float:left'>   <div class=\"devicename\">" +data[i].name + "</div><div class=\"ip\" id='ip"+i+"'>" + status + "</div></div></div>"

			}
			else
			{
				//newcell.innerHTML="<img src='TV.png' class=\"deviceIcon\"/>"
				newcell.innerHTML="<div class=\"testNormal\" id=\"items\"  name=\""+i+"\">   <div style='float:left'><img src='TV.png' class=\"deviceIcon\"/></div> <div class='trText' style='float:left'>   <div class=\"devicename\">" +data[i].name + "</div><div class=\"ip\" id='ip"+i+"'>" + status + "</div></div></div>"				
			}
			
			//第二列

			//newcell= newrow.insertCell(1);
			//newcell.innerHTML = '<div class=\"devicename\">' +data[i].name + '</div>'+'<div class=\"ip\">' +data[i].ip.replace(/http:\/\//,'') + '</div>';
			
			newcell.class="trText";
			newrow.addEventListener('click', function(){selectDevice(this.name); var ipText=document.getElementById("ip"+this.name); if (ipText.innerHTML!="播放中"){onClickVideoPlay(mediaurl[0].name,mediaurl[0].url,BG.device_list[this.name].ip); ipText.innerHTML="播放中";}else{onClickVideoStop(mediaurl[0].name,mediaurl[0].url,BG.device_list[this.name].ip);ipText.innerHTML=BG.device_list[this.name].ip.replace(/http:\/\//,'')}});		
	        //var item=newcell.getElementById("items");
	        var item = newcell.firstChild;
			item.addEventListener('mouseover', function(){var para = this.className = "testOver"; });		
			item.addEventListener('mouseout', function(){var para = this.className = "testNormal"; this.style="cursor:pointer" });		
				

			
		}
		var index=mytable.rows.length;
		var newrow = mytable.insertRow(index);	
		var newcell= newrow.insertCell();
		//newcell= newrow.insertCell(1);		
		newcell.innerHTML = '<div class=\"devicename\">' + '</div>'+'<div class=\"ip\">' + '</div>';		
	}




	
    function filltable(data,isMedia) {
		if(data==undefined || data.length==0)
		{
			var id=(isMedia?"mediatable":"blocktable");
			document.getElementById(id).className="mylist full";
			return;
		}
		var id1="website",id2="blocklist";
		if(isMedia)
			{id1="mediaurl",id2="medialist";}
		//document.getElementById(id1).innerText+="(共"+data.length+"个)";
		var mytable=document.all(id2);
		mytable.deleteRow();
		for (var i = 0; i < data.length; i++) {
			var index=mytable.rows.length;
			var newrow = mytable.insertRow(index);
			//第一列
			var newcell= newrow.insertCell();
			newcell.innerHTML=(i+1)+".";
			//第二列
			newcell= newrow.insertCell(1);
			var url=data[i];
			if(isMedia)
			{	
				url=data[i].url;
				newcell.innerHTML = '<a href="'+url+'" title="'+url+'" target="_blank">' + data[i].name + '</a> <b>(' + data[i].size + ')</b>';
			}
			else
			{
				newcell.innerHTML='<a href="'+url+'" title="'+url+'" target="_blank">'+url+'</a>';
			}
			//第三列
			if(isMedia)
			{
				var name=data[i].name;
				var str=name.split(".");
				var ext = str[str.length-1];
				if(["flv","hlv","f4v","mp4"].indexOf(ext)!=-1)
					name=tabtitle+"."+ext;
				newcell= newrow.insertCell(2);
				newcell.style.cssText = "text-align:right;";
				newcell.innerHTML = '<input type="button" title="播放 '+name+'" value="播放" name="'+name+'" alt="'+url+'" />';
				newcell.firstChild.addEventListener('click', function(){onClickVideoPlay(this.name,this.alt);});

		        //chrome.browserAction.setPopup({'popup':''});
		
				//onClickVideoPlay(name,url);
			}
			
		}
    }

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

		//function onClickVideoPlay(name,media_url) {
		//		xmlHttp = createHttpRequest();
		//		var url2 = "http://192.168.0.131:6095/video/action=play&clientname=PC&url=" + encodeURIComponent(media_url)+"&name="+encodeURIComponent(name);
		//		xmlHttp.open("get", url2, true);
		//		xmlHttp.setRequestHeader("Content-Type", "text/json");
		//		xmlHttp.send();
		//		console.log("Send "+url2);	
		//	}

function onClickVideoPlay(name,media_url,ip) {
		xmlHttp = createHttpRequest();
		var url2 = ip+":6095/video/action=play&clientname=PC&url=" + encodeURIComponent(media_url)+"&title="+encodeURIComponent(name);
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
