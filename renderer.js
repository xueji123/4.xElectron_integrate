const {
    createAgoraRtcEngine,
    VideoMirrorModeType,
    VideoSourceType,
    RenderModeType,
    ChannelProfileType,
    ClientRoleType,
} = require("agora-electron-sdk");
const { stat } = require("fs");

let rtcEngine;
let localVideoContainer;
let remoteVideoContainer;
let isJoined = false;
// 填入你的临时 Token
let token = "";
// 用户 id，并确保其在频道内的唯一性
let uid = 123456;

const EventHandles = {
    // 监听本地用户加入频道事件
    onJoinChannelSuccess: ({ channelId, localUid }, elapsed) => {
        console.log('join success: ' + channelId);
        isJoined = true;
        // 本地用户加入频道后，设置本地视频窗口
        rtcEngine.setupLocalVideo({
            sourceType: VideoSourceType.VideoSourceCameraPrimary,
            view: localVideoContainer,
            mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
            renderMode: RenderModeType.RenderModeFit,
        });
    },

    onLeaveChannel: ({ channelId, localUid }, stats) => {
        console.log('leave success: ' + channelId);
        isJoined = false;
    },

    // 监听远端用户加入频道事件
    onUserJoined: ({ channelId, localUid }, remoteUid, elapsed) => {
        console.log('远端用户 ' + remoteUid + ' 已加入');
        // 远端用户加入频道后，设置远端视频窗口
        rtcEngine.setupRemoteVideoEx(
            {
                sourceType: VideoSourceType.VideoSourceRemote,
                uid: remoteUid,
                view: remoteVideoContainer,
                mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
                renderMode: RenderModeType.RenderModeFit,
            },
            { channelId, localUid },
        );
    },
};


window.onload = () => {
    const os = require("os");
    const path = require("path");

    // 填入你的 App ID
    const APPID = "";
    // 填入生成 Token 时使用的频道名
    const channel = "";

    localVideoContainer = document.getElementById("join-channel-local-video");
    remoteVideoContainer = document.getElementById("join-channel-remote-video");
    // const sdkLogPath = path.resolve(os.homedir(), "./test.log");
    const sdkLogPath = path.resolve("./agorasdk.log");


    // 创建 RtcEngine 实例
    rtcEngine = createAgoraRtcEngine();

    // 初始化 RtcEngine 实例
    rtcEngine.initialize({
        appId: APPID,
        logConfig: { filePath: sdkLogPath }
    });


    //接入混合云 or 私有云
    let config = {
        advancedConfig: {
            logUploadServer: {
                serverDomain: "",
                serverPath: "",
                serverHttps: false,
                serverPort: 0
            }
        },
        domainListSize: 0,
        mode: 1,
        domainList: [],
        ipListSize: 1,
        ipList: ["1.1.1.1"],
        verifyDomainName: "ap.xxx.agora.local"
    }

    // rtcEngine.setLocalAccessPoint(config);

    // 注册事件回调
    // rtcEngine.registerEventHandler(EventHandles);

    /**
 * Occurs when a user joins a channel.
 * This callback notifies the application that a user joins a specified channel.
 *
 * @param connection The connection information. See RtcConnection .
 * @param elapsed The time elapsed (ms) from the local user calling joinChannel until the SDK triggers this callback.
 *  onJoinChannelSuccess?(connection: RtcConnection, elapsed: number): void;
 */
    const onJoinChannelSuccess = ({ channelId, localUid }, elapsed) => {
        console.log('join success: addListener ' + channelId);
        isJoined = true;
        // 本地用户加入频道后，设置本地视频窗口
        rtcEngine.setupLocalVideo({
            sourceType: VideoSourceType.VideoSourceCameraPrimary,
            view: localVideoContainer,
            mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
            renderMode: RenderModeType.RenderModeFit,
        });
    };
    rtcEngine.addListener('onJoinChannelSuccess', onJoinChannelSuccess);
    // rtcEngine.removeListener('onJoinChannelSuccess', onJoinChannelSuccess);



    /**
      * Occurs when a user leaves a channel.
      * This callback notifies the app that the user leaves the channel by calling leaveChannel . From this callback, the app can get information such as the call duration and quality statistics.
      *
      * @param connection The connection information. See RtcConnection .
      * @param stats The statistics of the call. See RtcStats .
      *  onLeaveChannel?(connection: RtcConnection, stats: RtcStats): void;
      */
    const onLeaveChannel = ({ channelId, localUid }, stats) => {
        console.log('leave success: ' + channelId + ' memoryAppUsageRatio: ' + stats.memoryAppUsageRatio + ' memoryTotalUsageRatio ' + stats.memoryTotalUsageRatio);
        isJoined = false;
    }
    rtcEngine.addListener('onLeaveChannel', onLeaveChannel);


    /**
* Occurs when the local audio stream state changes.
* When the state of the local audio stream changes (including the state of the audio capture and encoding), the SDK triggers this callback to report the current state. This callback indicates the state of the local audio stream, and allows you to troubleshoot issues when audio exceptions occur.When the state is LocalAudioStreamStateFailed (3), you can view the error information in the error parameter.
*
* @param connection The connection information. See RtcConnection .
* @param state The state of the local audio. See LocalAudioStreamState .
* @param error Local audio state error codes. See LocalAudioStreamError .
* onLocalAudioStateChanged?(connection: RtcConnection, state: LocalAudioStreamState, error: LocalAudioStreamError): void;
*/
    const onLocalAudioStateChanged = ({ channelId, localUid }, state, error) => {
        console.log('onLocalAudioStateChanged' + ' channelId: ' + channelId + ' localuid: ' + localUid + ' state: ' + state + ' error: ' + error);
    }
    rtcEngine.addListener('onLocalAudioStateChanged', onLocalAudioStateChanged);



    /**
 * Reports the volume change of the audio device or app.
 * Occurs when the volume on the playback device, audio capture device, or the volume in the application changes.This callback is for Windows and macOS only.
 *
 * @param deviceType The device type. See MediaDeviceType .
 * @param volume The volume value. The range is [0, 255].
 * @param muted Whether the audio device is muted:true: The audio device is muted.false: The audio device is not muted.
 * onAudioDeviceVolumeChanged ? (deviceType: MediaDeviceType, volume: number, muted: boolean): void;
 */
    const onAudioDeviceVolumeChanged = (deviceType, volume, muted) => {
        console.log('onAudioDeviceVolumeChanged' + ' deviceType: ' + deviceType + ' volume: ' + volume + ' muted: ' + muted);
    }
    // rtcEngine.addListener('onAudioDeviceVolumeChanged', onAudioDeviceVolumeChanged);


    /**
    * Reports the volume information of users.
    * By default, this callback is disabled. You can enable it by calling enableAudioVolumeIndication . Once this callback is enabled and users send streams in the channel, the SDK triggers the onAudioVolumeIndication callback according to the time interval set in enableAudioVolumeIndication. The SDK triggers two independent onAudioVolumeIndication callbacks simultaneously, which separately report the volume information of the local user who sends a stream and the remote users (up to three) whose instantaneous volume is the highest.Once this callback is enabled, if the local user calls the muteLocalAudioStream method for muting, the SDK continues to report the volume indication of the local user. In the callbacks triggered, the volume information about the local user is 0 If a remote user whose volume is one of the three highest in the channel stops publishing the audio stream for 20 seconds, the callback excludes this user's information; if all remote users stop publishing audio streams for 20 seconds, the SDK stops triggering the callback for remote users.
    *
    * @param connection The connection information. See RtcConnection .
    * @param speakers The volume information of the users, see AudioVolumeInfo . An empty speakers array in the callback indicates that no remote user is in the channel or is sending a stream.
    * @param speakerNumber The total number of users.In the callback for the local user, if the local user is sending streams, the value of speakerNumber is 1.In the callback for remote users, the value range of speakerNumber is [0,3]. If the number of remote users who send streams is greater than or equal to three, the value of speakerNumber is 3.
    * @param totalVolume The volume of the speaker. The value range is [0,255].In the callback for the local user, totalVolume is the volume of the local user who sends a stream.In the callback for remote users, totalVolume is the sum of the volume of all remote users (up to three) whose instantaneous volume is the highest.
    *     onAudioVolumeIndication?(connection: RtcConnection, speakers: AudioVolumeInfo[], speakerNumber: number, totalVolume: number): void;
    */
    const onAudioVolumeIndication = ({ channelId, localUid }, speakers, speakerNumber, totalVolume) => {

        if (speakers != null) {

            console.log(`onAudioVolumeIndication  channelId: ${channelId}  uid: ${speakers[0].uid}  volume: ${speakers[0].volume} speakerNumber: ${speakerNumber} totalVolume: ${totalVolume}`);

        }

    }
    rtcEngine.addListener('onAudioVolumeIndication', onAudioVolumeIndication);


    /**
   * Occurs when the video device state changes.
   * This callback reports the change of system video devices, such as being unplugged or removed. On a Windows device with an external camera for video capturing, the video disables once the external camera is unplugged.This callback is for Windows and macOS only.
   *
   * @param deviceId The device ID.
   * @param deviceType Media device types. See MediaDeviceType .
   * @param deviceState Media device states.
   *   onAudioDeviceStateChanged?(deviceId: string, deviceType: MediaDeviceType, deviceState: MediaDeviceStateType): void;
   */

    const onAudioDeviceStateChanged = (deviceId, deviceType, deviceState) => {

        console.log(`onAudioDeviceStateChanged  deviceId: ${deviceId}  deviceType: ${deviceType}  deviceState: ${deviceState}`);

        // setTimeout(() => {
        //     const deviceManager = rtcEngine.getAudioDeviceManager()


        //     const defaultRecording = deviceManager.getRecordingDefaultDevice()
        //     console.log(`setRecordingDevice  defaultRecording: ${JSON.stringify(defaultRecording)}`)
        //     rtcEngine.getAudioDeviceManager().setRecordingDevice(defaultRecording.deviceId)
        // }, 3000)



    }
    rtcEngine.addListener('onAudioDeviceStateChanged', onAudioDeviceStateChanged);


    /**
    * Occurs when the video device state changes.
    * This callback reports the change of system video devices, such as being unplugged or removed. On a Windows device with an external camera for video capturing, the video disables once the external camera is unplugged.This callback is for Windows and macOS only.
    *
    * @param deviceId The device ID.
    * @param deviceType Media device types. See MediaDeviceType .
    * @param deviceState Media device states.
    *      onVideoDeviceStateChanged?(deviceId: string, deviceType: MediaDeviceType, deviceState: MediaDeviceStateType): void;
    */

    const onVideoDeviceStateChanged = (deviceId, deviceType, deviceState) => {

        console.log(`onVideoDeviceStateChanged  deviceId: ${deviceId}  deviceType: ${deviceType}  deviceState: ${deviceState}`);

    }
    rtcEngine.addListener('onVideoDeviceStateChanged', onVideoDeviceStateChanged);






    // 设置频道场景为直播场景
    rtcEngine.setChannelProfile(ChannelProfileType.ChannelProfileLiveBroadcasting);

    // 设置用户角色，主播设为 ClientRoleBroadcaster，观众设为 ClientRoleAudience
    rtcEngine.setClientRole(ClientRoleType.ClientRoleBroadcaster);

    // 视频默认禁用，你需要调用 enableVideo 启用视频流
    rtcEngine.enableVideo();

    // 开启摄像头预览
    // rtcEngine.startPreview({ sourceType: 0 });


    //开启音量回调
    // rtcEngine.enableAudioVolumeIndication(1200, 3, false)


    /*开启audio_unit采集解决问题
    解决mac平台无声问题
*********** 1852797029 ***********
错误码上报1852797029 。 1852797029是Mac系统CoreAudio中的系统错误码，kAudioHardwareIllegalOperationError。
此为ADM中，AudioDeviceCreateIOProcID采集播放创建回调失败的返回错误码。此时SDK采集播放回调没有正确起来，采集播放频率异常。系统无声。此种情况为系统硬件抽象层(HAL, Hardware Abstract Layer)状态存在问题。可退出频道稍后再进，或尝试重启CoreAudio服务：
sudo launchctl kickstart -kp system/com.apple.audio.coreaudiod
或使用AudioUnit可规避此类状态问题导致的无声不可用。
*/

    // rtcEngine.setParameters("{\"che.audio.mac_adm.use_audio_unit_hal\":true}");
    // rtcEngine.setParameters(JSON.stringify({ 'che.audio.mac_adm.use_audio_unit_hal': true }))



    rtcEngine.getAudioDeviceManager().followSystemRecordingDevice(false)
    rtcEngine.getAudioDeviceManager().followSystemPlaybackDevice(false)

    // rtcEngine.getAudioDeviceManager().followSystemPlaybackDevice(false)

    // 使用临时 Token 加入频道
    rtcEngine.joinChannel(token, channel, uid, {});

    // rtcEngine.setupLocalVideo({
    //     sourceType: VideoSourceType.VideoSourceCameraPrimary,
    //     view: localVideoContainer,
    //     mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
    //     renderMode: RenderModeType.RenderModeFit,
    // });



    //为按钮绑定单击响应函数
    let btn01 = document.getElementById("open_Video");
    btn01.onclick = () => {


        rtcEngine.enableLocalAudio(true)

        rtcEngine.enableLocalVideo(true)

        rtcEngine.setupLocalVideo({
            sourceType: VideoSourceType.VideoSourceCameraPrimary,
            view: localVideoContainer,
            mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
            renderMode: RenderModeType.RenderModeFit,
        });

        console.log("open_Video")





    };

    let btn02 = document.getElementById("close_Video");

    btn02.onclick = () => {
        rtcEngine.enableLocalVideo(false)
        rtcEngine.destroyRendererByView(localVideoContainer)
        console.log("close_Video")
        // localVideoContainer.remove()




    }

    let btn03 = document.getElementById("start_Preview");

    btn03.onclick = () => {


        rtcEngine.setupLocalVideo({
            sourceType: VideoSourceType.VideoSourceCameraPrimary,
            view: localVideoContainer,
            mirrorMode: VideoMirrorModeType.VideoMirrorModeDisabled,
            renderMode: RenderModeType.RenderModeFit,
        });

        rtcEngine.startPreview()

        console.log("starPreview")


    }

    let btn04 = document.getElementById("stop_Preview");

    btn04.onclick = () => {
        rtcEngine.stopPreview()

        rtcEngine.destroyRendererByView(localVideoContainer)


        console.log("stopPreview")


    }

    let btn05 = document.getElementById("leave");

    btn05.onclick = () => {
        rtcEngine.leaveChannel()

        console.log("start leave channel")

        // rtcEngine.removeListener('onJoinChannelSuccess', onJoinChannelSuccess);

        // rtcEngine.setRecordingDeviceVolume(50)

    }

    let btn06 = document.getElementById("open_Audio");

    btn06.onclick = () => {
        // rtcEngine.enableLocalAudio(true)

        // console.log("start open_Audio")

        // rtcEngine.removeListener('onJoinChannelSuccess', onJoinChannelSuccess);

        // rtcEngine.setRecordingDeviceVolume(50)

        rtcEngine.getAudioDeviceManager().setPlaybackDeviceVolume(50)

    }

    let btn07 = document.getElementById("close_Audio");

    btn07.onclick = () => {
        // rtcEngine.enableLocalAudio(false)

        // console.log("start close_Audio")

        rtcEngine.removeListener('onAudioVolumeIndication', onAudioVolumeIndication);

        // rtcEngine.getAudioDeviceManager().setRecordingDeviceVolume(50)


        console.log("removeListener onAudioVolumeIndication")


    }


    let btn08 = document.getElementById("followSystem");

    btn08.onclick = () => {
        rtcEngine.getAudioDeviceManager().followSystemPlaybackDevice(true);
        // rtcEngine.getAudioDeviceManager().followSystemRecordingDevice(true)
        console.log(`start followSystem true`)


    }

    let btn09 = document.getElementById("unfollowSystem");

    btn09.onclick = () => {
        rtcEngine.getAudioDeviceManager().followSystemPlaybackDevice(false);
        // rtcEngine.getAudioDeviceManager().followSystemRecordingDevice(false)
        console.log(`start followSystem false`)


    }






}