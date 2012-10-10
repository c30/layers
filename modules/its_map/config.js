var tbmini={};
Ext.onReady(function() {
			tbmini = new cms.tool.k();
			tbmini.getControl();
		});
function gpsAlarmInfo(longitude, latitude, elementId) {
		var pointmove=tbmini.vector.getFeaturesByAttribute('nodeid',elementId)[0];
		pointmove.geometry.x=longitude;
		pointmove.geometry.y=latitude;
		if (tbmini.popup != null) {
		tbmini.popup.close();
		}
		tbmini.vector.redraw();
	}
