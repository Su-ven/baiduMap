/**
 * 
 * @authors Suven (star_riness@163.com)
 * @date    2017-09-11 06:45:53
 */

var toggleMenu = function(){
	if (swiper.previousIndex == 0){
		swiper.slidePrev()
	}else{
		swiper.slideNext()
	}
}
var menuButton = document.getElementsByClassName('menu-button')[0];
var btn = $('.menu-button');

var swiper = new Swiper('.swiper-container', {
	slidesPerView: 'auto', 
	initialSlide: 1, 
	resistanceRatio: 0.00000000000001, 
	simulateTouch: false,
	onSlideChangeStart: function(slider) {
		if (slider.activeIndex == 0) {
			menuButton.classList.add('cross')
		}else{
			menuButton.classList.remove('cross')
		}
		btn.off('click').on('click', toggleMenu);
	},
	slideToClickedSlide: false
})

var map;
var markers = [];
var cont ='';
var contPoint = {lat: '', lng: ''};

var mapData = {
	center: {lng: 114.060416, lat:22.549022},
	zoom : 14,
	locations : [
		//公园 
	    {title: '洪湖公园', location: {lng: 114.126227 ,lat: 22.571781}, type:'park'},
		{title: '深圳野生动物园', location: {lng: 113.978411 ,lat: 22.604655}, type:'park'},
		{title: '东湖公园', location: {lng: 114.155012 ,lat: 22.569505}, type:'park'},
		{title: '人民公园', location: {lng:  114.123593 ,lat: 22.559683}, type:'park'},
		{title: '红树林', location: {lng: 114.006794 ,lat: 22.528928}, type:'park'},
		{title: '世界之窗', location: {lng: 113.980442 ,lat: 22.542145}, type:'park'},
		//医院 
		{title: '深圳市罗湖区人民医院', location: {lng: 114.128628 ,lat: 22.544191}, type:'hospital'},
		{title: '深圳市第二人民医院', location: {lng: 114.092262 ,lat: 22.563032}, type:'hospital'},
		{title: '香港大学深圳医院', location: {lng: 114.002473 ,lat: 22.531831}, type:'hospital'},
		{title: '北京大学深圳医院', location: {lng: 114.05564, lat: 22.562485}, type:'hospital'},
		{title: '深圳市人民医院(留医部)', location: {lng: 114.134333, lat: 22.563348}, type:'hospital'},
		// 酒店
		{title: '七街公馆', location: {lng: 114.039033, lat: 22.563655}, type:'hotel'},
		{title: '维也纳酒店(深圳国王店)', location: {lng: 114.013034, lat: 22.665263}, type:'hotel'},
		{title: '华侨酒店', location: {lng: 114.122758, lat: 22.534887}, type:'hotel'},
		{title: '维纳斯酒店', location: {lng: 114.04371, lat: 22.632384}, type:'hotel'},
		{title: '竹园宾馆', location: {lng: 114.141124, lat: 22.56557}, type:'hotel'},
		// 学校
		{title: '深圳大学', location: {lng: 113.942501, lat: 22.539013}, type:'school'},
		{title: '南方科技大学', location: {lng: 114.005069, lat: 22.601371}, type:'school'},
		{title: '香港中文大学(深圳)', location: {lng: 114.217476, lat: 22.692981}, type:'school'},
		{title: '布吉中学', location: {lng: 114.121038, lat: 22.615711}, type:'school'},
		{title: '深圳科学高中', location: {lng: 114.089182, lat: 22.641001}, type:'school'},
	],
}

// mapdata中的数据 都通过 model进行分发 
var model =  {
	init: function(){
		view.init();
	},
	mapCenter: function(){
		return mapData.center;
	},
	mapZoom: function(){
		return mapData.zoom;
	},
	mapLocations: function(){
		return mapData.locations;
	}
}

// 视图
var view = {
	data: function(){
		// 取得mapdata中的数据
		var obj = {}
		obj.center = model.mapCenter();
		obj.zoom = model.mapZoom();
		obj.locations = model.mapLocations();
		return obj;
	},
	init: function(){
		var data = this.data();
		// 创建地图实例
		map = new BMap.Map("allmap");
		//添加地图类型控件
		map.addControl(new BMap.MapTypeControl());
		//开启鼠标滚轮缩放
		map.enableScrollWheelZoom(true);
		map.centerAndZoom(new BMap.Point(data.center.lng, data.center.lat), data.zoom);
		// 获得地点集合
		var locations = data.locations;
		
		// 查询参数设置
		var settings = {
			pageCapacity: 1,
			onSearchComplete: function(results){
				// 这里通过百度地图api查询点击的点的详细信息
	          	if (localSearch.getStatus() == BMAP_STATUS_SUCCESS){
	                var createMsg = '<p>名字: '+results.vr[0].title+'</p><p>地址: '+results.vr[0].province+results.vr[0].city+results.vr[0].address+'</p><p><a href="'+results.vr[0].detailUrl+'"> 详情>> </a></p>'
	                var opts = {
	                  title : results.vr[0].title , // 信息窗口标题
	                  message: createMsg
	                }
	                var point = new BMap.Point(contPoint.lng, contPoint.lat);
	                var infoWindow = new BMap.InfoWindow(createMsg);
             		map.openInfoWindow(infoWindow, point);
	          	}
	      	}
		}

		var localSearch = new BMap.LocalSearch(map, settings);

		for (var i = 0; i < locations.length; i++) {
			var position = locations[i].location;
			// 创建标注
			var marker = new BMap.Marker(new BMap.Point(position.lng,position.lat));
			map.addOverlay(marker);
			marker.type = locations[i].type;
			marker.placeName = locations[i].title;
			locations[i]['marker'] = marker;
			marker.addEventListener('click',function(e) {
				contPoint.lat = this.point.lat;
				contPoint.lng = this.point.lng;
				localSearch.search(this.placeName);
			});
		}
	}
}

// 初始化
model.init();

// 命名location会导致报错，单个点的构造函数
function locat(data){
	this.title = ko.observable(data.title);
	this.marker = data.marker;
	this.type = data.type;
	this.isShow = ko.observable(true);
	this.name = data.title;
	this.location = data.location;
}

// 视图模型
var viewModel = function(){
	var _this = this;
	this.inputCont = ko.observable('');
	this.locationList = ko.observableArray([]);
	var locations = model.mapLocations();
	for (var i = 0; i < locations.length; i++) {
		this.locationList.push(new locat(locations[i]));
	}
	this.currentLoc = ko.observable(this.locationList()[0]);

	// 点击列表名称 对应标记动画
	this.markerClickFn = function(nowLocation) { 
		locationPosition(locations, nowLocation);
	};

	this.searchPosition = ko.computed(function(){
		var res = _this.locationList();
		var content = _this.inputCont();
		// 搜索内容为无
		if(!content){
			return ko.utils.arrayFilter(res,  function(position, index) {
				position.marker.show();
				return res;
			});
		}else{
			return ko.utils.arrayFilter(res,  function(position, index) {
				// 先隐藏所有的标记，并定义输入内容是否有相关字符，状态为false
				position.marker.hide();
				var isInclude = false;
	            if( position.name.indexOf(_this.inputCont()) > -1){
	            	// 如果有相关字符，则做对应显示
	            	position.marker.show();
	            	isInclude = true;
	            }
	            return isInclude;
          	});
		}
	})

	this.btnClickFn = function(type) {
		var locations = this.locationList();
		// 循环列表项
		for(var i = 0; i < locations.length; i++){
			// 这里和查询的逻辑一样，先做所有的隐藏，再做相关的显示
			locations[i].marker.hide();
			locations[i].isShow(false);
			// 根据类型判断是否显示
			if (type == 'all') {
				locations[i].isShow(true);
				locations[i].marker.show();
			}else{
				if(type == locations[i].type){
					locations[i].isShow(true);
					locations[i].marker.show();
				}
			}
		}
	};
}

/* 点击标记后，把地图视觉中心指向当前标记，并弹跳动画 */
function locationPosition(locations, acLocation) {
	/*先把所有的清空一下*/
   	locations.forEach(function(locatIndex){
   		locatIndex.marker.setAnimation(null);
   	});
    map.centerAndZoom(new BMap.Point(acLocation.location.lng,acLocation.location.lat), 15);
	acLocation.marker.setAnimation(BMAP_ANIMATION_BOUNCE);
}


ko.applyBindings(new viewModel());