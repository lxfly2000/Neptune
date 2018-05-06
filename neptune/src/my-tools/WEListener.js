/**
 * Created by Pencil on 2017/7/14 0014.
 */

window.wallpaperPropertyListener = {
    applyUserProperties: function (props) {
        this.called = true;

        if (props.volume)
            MyTools.setVolume(props.volume.value / 10);

        if (props.showdialog)
            MyTools.setDialogEnabled(props.showdialog.value);


        if (props.freefollowing)
            MyTools.setFreeFollowingEnabled(props.freefollowing.value);

        if (props.bgimg)
            MyTools.setBackground(props.bgimg.value && 'file:///' + props.bgimg.value, 'img');

        if (props.bgurl)
            MyTools.setBackground(props.bgurl.value, 'url');

        if (props.showleaves)
            MyTools.setLeavesEnabled(props.showleaves.value);

        if (props.leavesnum)
            MyTools.setLeaves('num', props.leavesnum.value);

        if (props.leavesselffalls)
            MyTools.setLeaves('self_falls', props.leavesselffalls.value);

        if (props.leavesinterval)
            MyTools.setLeaves('speed', props.leavesinterval.value * 100);

        if (props.fps) {
            if (props.fps.value === true)
                MyTools.startFps();
            else
                MyTools.stopFps();
        }

        if (props.log)
            $('#myconsole').css('display', props.log.value ? 'inline' : 'none');

        /* ===========================================================
         * Model settings
         */
        if (props.altidle)
            MyTools.altIdleEnabled = props.altidle.value;

        if (props.scale)
            MyTools.scale(props.scale.value / 100);

        if (props.offsetx && !isNaN(props.offsetx.value))
            MyTools.offsetX(props.offsetx.value);

        if (props.offsety && !isNaN(props.offsety.value))
            MyTools.offsetY(props.offsety.value);

        if (props.custommodel)
            MyTools.setCustomModelEnabled(props.custommodel.value);

        if (props.custommodelfile)
            MyTools.setCustomModel(props.custommodelfile.value);
    },

    setPaused: function (paused) {
        if (paused) {
            MyTools.pauseLeaves();

            if (MyTools.fpsEnabled) {
                this.fpsPaused = true;
                MyTools.stopFps();
            }
        } else {
            MyTools.resumeLeaves();

            if (this.fpsPaused) {
                this.fpsPaused = false;
                MyTools.startFps();
            }
        }
    }
};