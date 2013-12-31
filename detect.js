
var mylocalip;
var device_list=[];
function enumLocalIPs(cb) {
  var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
  if (!RTCPeerConnection) return false;
  var addrs = Object.create(null);
  addrs['0.0.0.0'] = false;
  function addAddress(newAddr) {
    if (newAddr in addrs) return;
    addrs[newAddr] = true;
    cb(newAddr);
  }
  function grepSDP(sdp) {
    var hosts = [];
    sdp.split('\r\n').forEach(function (line) {
      if (~line.indexOf('a=candidate')) {
        var parts = line.split(' '),
            addr = parts[4],
            type = parts[7];
        if (type === 'host') addAddress(addr);
      } else if (~line.indexOf('c=')) {
        var parts = line.split(' '),
        addr = parts[2];
        addAddress(addr);
      }
    });
  }
  var rtc = new RTCPeerConnection({iceServers:[]});
  if (window.mozRTCPeerConnection) rtc.createDataChannel('', {reliable:false});
  rtc.onicecandidate = function (evt) {
    if (evt.candidate) grepSDP(evt.candidate.candidate);
  };
  setTimeout(function() {
    rtc.createOffer(function (offerDesc) {
      grepSDP(offerDesc.sdp);
      rtc.setLocalDescription(offerDesc);
    }, function (e) {});
  }, 500);
  return true;
}




function probe_peer(net) {
	    var orignal = net;
		net = net.replace(/(\d+\.\d+\.\d+)\.\d+/, '$1.');
	for (var i=1;i<100;i++)
	{ 
		if (orignal == (net+i))
		{
			continue;
		}	
		console.log("detect "+net+i);	
		$.ajax({
		  url:  "http://"+net+i+":6095/request?action=isAlive",
		  host: "http://"+net+i,
		  timeout: 500,
		  crossDomain: true,
		  processData: false,
		  dataType: 'html',
		  //dataType: "jsonp",
		  //jsonp: "callback",
		  //jsonpCallback:"foo",
		  error: function (requstObj, errorType, exceptionObj) {
		  },
		  success: function( msg ) {
			 var result = JSON.parse(msg);
			 console.log("Find "+this.host+" "+result.data.devicename);	
			 // console.log("Find "+msg.data.devicename);		

			for (var i = 0; i<device_list.length; i++) {
				if(device_list[i].ip==this.host)//如果已有相同ip则不重复记录
					return;
			}			 	
			device_list.push({ip:this.host,name:result.data.devicename,isPlaying:false});
			setPopup();			    
		  	 //device_list.push({name: msg.deviceName, uri:this.host})
		  }
		});
	}				
	for (var i=100;i<150;i++)
	{ 
		if (orignal == (net+i))
		{
			continue;
		}
		console.log("detect "+net+i);	
		$.ajax({
		  url:  "http://"+net+i+":6095/request?action=isAlive",
		  host: "http://"+net+i,
		  timeout: 500,
		  crossDomain: true,
		  processData: false,
		  dataType: 'html',
		  //dataType: "jsonp",
		  //jsonp: "callback",
		  //jsonpCallback:"foo",
		  error: function (requstObj, errorType, exceptionObj) {
		  },
		  success: function( msg ) {
			 var result = JSON.parse(msg);
			 console.log("Find "+this.host+" "+result.data.devicename);	
			 // console.log("Find "+msg.data.devicename);		

			for (var i = 0; i<device_list.length; i++) {
				if(device_list[i].ip==this.host)//如果已有相同ip则不重复记录
					return;
			}			 	
			device_list.push({ip:this.host,name:result.data.devicename});
			setPopup();			    
		  	 //device_list.push({name: msg.deviceName, uri:this.host})
		  }
		});
	}
	for (var i=150;i<255;i++)
	{
		if (orignal == (net+i))
		{
			continue;
		}		 
		console.log("detect "+net+i);	
		$.ajax({
		  url:  "http://"+net+i+":6095/request?action=isAlive",
		  host: "http://"+net+i,
		  timeout: 500,
		  crossDomain: true,
		  processData: false,
		  dataType: 'html',
		  //dataType: "jsonp",
		  //jsonp: "callback",
		  //jsonpCallback:"foo",
		  error: function (requstObj, errorType, exceptionObj) {
		  },
		  success: function( msg ) {
			 var result = JSON.parse(msg);
			 console.log("Find "+this.host+" "+result.data.devicename);	
			 // console.log("Find "+msg.data.devicename);		

			for (var i = 0; i<device_list.length; i++) {
				if(device_list[i].ip==this.host)//如果已有相同ip则不重复记录
					return;
			}			 	
			device_list.push({ip:this.host,name:result.data.devicename});
			setPopup();			    
		  	 //device_list.push({name: msg.deviceName, uri:this.host})
		  }
		});
	}	
}	
	
function updateDeviceList()
{
	//device_list=[];
	enumLocalIPs(function(localIp) {
		mylocalip = localIp;
		console.log("Local ip is "+mylocalip);		
	    probe_peer(mylocalip);
	})
}




