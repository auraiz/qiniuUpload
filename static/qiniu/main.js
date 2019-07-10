/*global Qiniu */
/*global plupload */
/*global FileProgress */
/*global hljs */

$(function() {
    var uploader = Qiniu.uploader({
        disable_statistics_report: false,
        runtimes: 'html5,flash,html4',// 上传模式，依次退化
        browse_button: 'pickfiles',// 上传选择文件的点选按钮，必需
        container: 'container',// 上传区域DOM ID，默认是browser_button的父元素
        drop_element: 'container',//拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
        max_file_size: '1000mb',// 最大文件体积限制
        flash_swf_url: 'js/plupload/Moxie.swf',// 引入flash，相对路径
        dragdrop: true, // 关闭可拖曳上传
        chunk_size: '4mb',// 分块上传时，每块的体积
        multi_selection: !(moxie.core.utils.Env.OS.toLowerCase() === "ios"),
        //uptoken:'RyTsz13-hQAzM6XRz6zHxCVi2RdM-rKfh08iX_Xy:OsUWqsXNqX5wAAXxg5xg1tdIhT8=:eyJzY29wZSI6ImpjbXgiLCJkZWFkbGluZSI6MTU2MDg2OTMyM30=',
        uptoken_url: '/app/informationTime/gettoken', //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
        // uptoken_func: function(){
        //     var ajax = new XMLHttpRequest();
        //     ajax.open('GET', $('#uptoken_url').val(), false);
        //     ajax.setRequestHeader("If-Modified-Since", "0");
        //     ajax.send();
        //     if (ajax.status === 200) {
        //         var res = JSON.parse(ajax.responseText);
        //         console.log('custom uptoken_func:' + res.uptoken);
        //         return res.uptoken;
        //     } else {
        //         console.log('custom uptoken_func err');
        //         return '';
        //     }
        // },
        domain: 'http://image.vpxls.com/',// bucket域名，下载资源时用到，必需
        get_new_uptoken: false,// 设置上传文件的时候是否每次都重新获取新的uptoken
        //downtoken_url: '/downtoken',
        // unique_names: true,
        // save_key: true,
        // x_vars: {
        //     'id': '1234',
        //     'time': function(up, file) {
        //         var time = (new Date()).getTime();
        //         // do something with 'time'
        //         return time;
        //     },
        // },
        auto_start: true, // 选择文件后自动上传，若关闭需要自己绑定事件触发上传
        log_level: 5,
        init: {
            'BeforeChunkUpload': function(up, file) {
                console.log("before chunk upload:", file.name);
            },
            'FilesAdded': function(up, files) {
                // 文件添加进队列后，处理相关的事情
                $('table').show();
                $('#success').hide();
                plupload.each(files, function(file) {
                    var progress = new FileProgress(file,
                        'fsUploadProgress');
                    progress.setStatus("等待...");
                    progress.bindUploadCancel(up);
                });
            },
            'BeforeUpload': function(up, file) {
                // 每个文件上传前，处理相关的事情
                console.log("this is a beforeupload function from init");
                var progress = new FileProgress(file, 'fsUploadProgress');
                var chunk_size = plupload.parseSize(this.getOption(
                    'chunk_size'));
                if (up.runtime === 'html5' && chunk_size) {
                    progress.setChunkProgess(chunk_size);
                }
            },
            'UploadProgress': function(up, file) {
                // 每个文件上传时，处理相关的事情
                var progress = new FileProgress(file, 'fsUploadProgress');
                var chunk_size = plupload.parseSize(this.getOption(
                    'chunk_size'));
                progress.setProgress(file.percent + "%", file.speed,
                    chunk_size);
            },
            'UploadComplete': function() {
                //队列文件处理完毕后，处理相关的事情
                $('#success').show();
                $('#videoRevoke').css("display","block");
                /*只能上传一个视频*/
                $("#container").css("display","none");
            },
            'FileUploaded': function(up, file, info) {
                // 每个文件上传成功后，处理相关的事情
                var progress = new FileProgress(file, 'fsUploadProgress');
                console.log("info:", info);
                console.log("response:", info.response);
                progress.setComplete(up, info.response);
            },
            'Error': function(up, err, errTip) {
                //上传出错时,处理相关的事情
                $('table').show();
                var progress = new FileProgress(err.file, 'fsUploadProgress');
                progress.setError();
                progress.setStatus(errTip);
            }
            // ,
            // 'Key': function(up, file) {
            // 若想在前端对每个文件的key进行个性化处理，可以配置该函数
            // 该配置必须要在 unique_names: false , save_key: false 时才生效
            //     var key = "";
            //     // do something with key
            //     return key
            // }
        }
    });
    //uploader.init();
    uploader.bind('BeforeUpload', function() {
        console.log("hello man, i am going to upload a file");
    });
    uploader.bind('FileUploaded', function() {
        console.log('hello man,a file is uploaded');
    });
    $('#container').on(
        'dragenter',
        function(e) {
            e.preventDefault();
            $('#container').addClass('draging');
            e.stopPropagation();
        }
    ).on('drop', function(e) {
        e.preventDefault();
        $('#container').removeClass('draging');
        e.stopPropagation();
    }).on('dragleave', function(e) {
        e.preventDefault();
        $('#container').removeClass('draging');
        e.stopPropagation();
    }).on('dragover', function(e) {
        e.preventDefault();
        $('#container').addClass('draging');
        e.stopPropagation();
    });



    $('#show_code').on('click', function() {
        $('#myModal-code').modal();
        $('pre code').each(function(i, e) {
            hljs.highlightBlock(e);
        });
    });


    $('body').on('click', 'table button.btn', function() {
        $(this).parents('tr').next().toggle();
    });


    var getRotate = function(url) {
        if (!url) {
            return 0;
        }
        var arr = url.split('/');
        for (var i = 0, len = arr.length; i < len; i++) {
            if (arr[i] === 'rotate') {
                return parseInt(arr[i + 1], 10);
            }
        }
        return 0;
    };

    $('#myModal-img .modal-body-footer').find('a').on('click', function() {
        var img = $('#myModal-img').find('.modal-body img');
        var key = img.data('key');
        var oldUrl = img.attr('src');
        var originHeight = parseInt(img.data('h'), 10);
        var fopArr = [];
        var rotate = getRotate(oldUrl);
        if (!$(this).hasClass('no-disable-click')) {
            $(this).addClass('disabled').siblings().removeClass('disabled');
            if ($(this).data('imagemogr') !== 'no-rotate') {
                fopArr.push({
                    'fop': 'imageMogr2',
                    'auto-orient': true,
                    'strip': true,
                    'rotate': rotate,
                    'format': 'png'
                });
            }
        } else {
            $(this).siblings().removeClass('disabled');
            var imageMogr = $(this).data('imagemogr');
            if (imageMogr === 'left') {
                rotate = rotate - 90 < 0 ? rotate + 270 : rotate - 90;
            } else if (imageMogr === 'right') {
                rotate = rotate + 90 > 360 ? rotate - 270 : rotate + 90;
            }
            fopArr.push({
                'fop': 'imageMogr2',
                'auto-orient': true,
                'strip': true,
                'rotate': rotate,
                'format': 'png'
            });
        }

        $('#myModal-img .modal-body-footer').find('a.disabled').each(
            function() {

                var watermark = $(this).data('watermark');
                var imageView = $(this).data('imageview');
                var imageMogr = $(this).data('imagemogr');

                if (watermark) {
                    fopArr.push({
                        fop: 'watermark',
                        mode: 1,
                        image: 'http://www.b1.qiniudn.com/images/logo-2.png',
                        dissolve: 100,
                        gravity: watermark,
                        dx: 100,
                        dy: 100
                    });
                }

                if (imageView) {
                    var height;
                    switch (imageView) {
                        case 'large':
                            height = originHeight;
                            break;
                        case 'middle':
                            height = originHeight * 0.5;
                            break;
                        case 'small':
                            height = originHeight * 0.1;
                            break;
                        default:
                            height = originHeight;
                            break;
                    }
                    fopArr.push({
                        fop: 'imageView2',
                        mode: 3,
                        h: parseInt(height, 10),
                        q: 100,
                        format: 'png'
                    });
                }

                if (imageMogr === 'no-rotate') {
                    fopArr.push({
                        'fop': 'imageMogr2',
                        'auto-orient': true,
                        'strip': true,
                        'rotate': 0,
                        'format': 'png'
                    });
                }
            });

        var newUrl = Qiniu.pipeline(fopArr, key);

        var newImg = new Image();
        img.attr('src', 'images/loading.gif');
        newImg.onload = function() {
            img.attr('src', newUrl);
            img.parent('a').attr('href', newUrl);
        };
        newImg.src = newUrl;
        return false;
    });

});
