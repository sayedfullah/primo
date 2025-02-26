(()=>
    {  
        const { warn, log, debug } = console;
        
        var doc, svgString;
        const parser = new DOMParser();
    
        const canvasConfig = {backgroundColor:"#fff",width:"300",height:"300",objectCaching:false,hoverCursor:"pointer",enableRetinaScaling:true};
        const canvas = new fabric.Canvas("canvas",canvasConfig);
        var obj, shapeGroup;
        //-----------------------------------------------
        var shapes
        ,shapeIndexSize = 0
        ,shapeIndex = 0
        ,cam;
        //-----------------------------------------------
        var alignCount = 0
        ,fontColCount = 0;
        
        let init =()=>
        {
            
            fetch("/svg/".concat(document.title),{method:"POST",contentType:"application/x-www-form-urlencoded"})
            .then(resp=> resp.json())
            .then(data=> 
            {
                
                doc = parser.parseFromString(data.obverse,"image/svg+xml");
                shapes = doc.getElementsByTagName("path");
                shapeIndexSize = shapes.length;
                cam = doc.getElementsByTagName("cam")[0];
    
                canvas.remove(obj);
                let impi = shapes[shapeIndex];
                let svg = createElement();
                svg.appendChild(impi);
    
                svgString = new XMLSerializer().serializeToString(svg);
    
                shapeGroup = fabric.loadSVGFromString(svgString,function(objects, options) 
                {
                  obj = fabric.util.groupSVGElements(objects, options);
                  obj.set({selectable:false,objectCache:false});
                  canvas.add(obj).renderAll();
                  obj.moveTo(0);
                  obj.center();
                });
                
                scaleCanvasUp();
            })
            .catch(er=>{warn(er);});
        };
    
        const addText=()=>
        {
            let props = 
            {
                fill:"#00f"
                ,originX:"center"
                ,originY:"center"
                ,left:225
                ,objectCaching:false
                ,textAlign:"center"
                ,top:180
                ,fontSize:10
                ,padding:50
                ,fontFamily:"z_lucida"
            };
            var s = new fabric.IText("text",props);
            canvas.add(s);
            canvas.renderAll();
        };
    
        const actionButtons=()=>
        {
            let g = $(".canvasBtn").toArray();
            $(g[0]).click(()=>{shapeChangerLeft();init();});
            $(g[1]).click(()=>  addText());
            $(g[2]).click(()=>{shapeChangerRight();init();});
        };
           
        const config=()=>
        {
            //basic settings
            fabric.Object.prototype.customiseCornerIcons({
                    settings: {
                            borderColor: '#efefef',
                            cornerSize: 25,
                            cornerShape: 'circle',
                            cornerBackgroundColor: '#efefef',
                            cornerPadding:7
                    }
                    ,tl:{icon: '../images/ico/delete.svg',cornerColor:"red"}
                    ,tr:{icon: '../images/ico/scale.svg'}
                    ,ml:{}
                    ,mr:{}
                    ,mt:{}
                    ,mb:{icon: '../images/ico/align.svg'}
                    ,bl:{icon: "../images/ico/palette.svg"}
                    ,br:{icon:"../images/ico/font.svg"}
                    ,mtr:{icon: '../images/ico/rotate.svg'}
            });
    
            fabric.Canvas.prototype.customiseControls({
                tl: {
                    cursor:"pointer"
                    ,action: 'remove'
                },
                tr: {
                    action: 'scale'
                },
                bl: {
                    cursor: 'pointer'
                    ,action: ()=>{
                                            let s = canvas.getActiveObject();
                                            fontColCount = (fontColCount > 1) ? 0 : fontColCount;
                                            s.set({fill:textColour(fontColCount)});
                                            fontColCount +=1;
                                            canvas.discardActiveObject().renderAll();
                                            canvas.setActiveObject(s);
                                        }
                },
                br: {
                    cursor: 'pointer'  
                    ,action: ()=>{
                        fontColCount = (fontColCount > 3) ? 0 : fontColCount;
                        let s = canvas.getActiveObject();
                        s.set({fontFamily:fontChanger(fontColCount)});
                        fontColCount++;
                                            canvas.discardActiveObject().renderAll();
                                            canvas.setActiveObject(s);
                    }
                },
                mb: {
                    cursor: 'pointer'
                    ,action: ()=>{
                        let s = canvas.getActiveObject();
                        alignCount = (alignCount > 2) ? 0 : alignCount;
                                            warn("aligncount: ",alignCount);
                        s.set({textAlign:textAlignment(alignCount)});
                        alignCount++;
                        canvas.discardActiveObject().renderAll();
                                            canvas.setActiveObject(s);
                    }
                },
                mr: {
                    cursor: 'pointer'
                },
                mt: {
                    action: 'moveUp'
                    ,cursor: 'pointer'
                },
                // only if hasRotatingPoint is not set to false
                mtr: {
                    action: 'rotate',
                    cursor: 'default'
                }
            }
            ,()=>{canvas.renderAll();});
        };
        
        //------------------------HELPER FUNCTIONS--------------------------------->
        const scaleCanvasUp=()=>
        {
            canvas.setWidth(450);
            canvas.setHeight(450);
            canvas.zoomToPoint(new fabric.Point(225, 225), 3);
        };
        
        const scaleCanvasDown=()=>
        {
            //optional method
            canvas.setWidth(300);
            canvas.setHeight(300);
        };
        
        const zoomCanvas=()=>
        {
            canvas.on('mouse:wheel', (opt)=> {
                    var delta = opt.e.deltaY;
                    var zoom = canvas.getZoom();
                    zoom *= 0.999 ** delta;
                    if (zoom > 5) zoom = 5;
                    if (zoom < 1) zoom = 1;
                    canvas.zoomToPoint(new fabric.Point(canvas.width/2, canvas.height/2), zoom);
                    opt.e.preventDefault();
                    opt.e.stopPropagation();
                  });
            
        };
        const textAlignment=(a)=>
        {
            return ["left","center","right"][a];
        };
        
        const textColour=(a)=>
        {
            return ["#f00","#00f"][a];
        };
        
        let createElement=()=>
        {
            var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.setAttribute("width",300);
            svg.setAttribute("height",300);
            return svg;
        };
        
        const shapeChangerRight=()=>
        {
            shapeIndex = (shapeIndex < (shapeIndexSize-1)) ? shapeIndex+1 : 0;
        };
        
        const shapeChangerLeft=()=>
        {
            shapeIndex = (shapeIndex !== 0) ? shapeIndex-1 : (shapeIndexSize-1);
        };
        
        const getCanvas=()=>
        {
            scaleCanvasDown();
            let result = canvas.toSVG();
            scaleCanvasUp();
            
            return result;
        };
        
        const svgDown =(docx)=>
        {
            let shapex = docx.getElementsByTagName("svg")[0];
            shapex.removeAttribute("viewBox"); 
            shapex.setAttribute("width","300");
            shapex.setAttribute("height","300");
            shapex.setAttribute("xmlns:mingh","http://www.minghworld.com");
            
            shapex.removeChild(docx.getElementsByTagName("rect")[0]);
            shapex.appendChild(cam);
           
            return new XMLSerializer().serializeToString(docx);
        };
        
        const downloadImage=()=> $(document).on("click","#_share",()=>
        {
            canvas.discardActiveObject();
    canvas.renderAll(); 
            let dim = 2000;
            var tmpCanvas = document.createElement('canvas');
            tmpCanvas.id="canvas";
            tmpCanvas.setAttribute("width",dim);
            tmpCanvas.setAttribute("height",dim);
            let ctx = tmpCanvas.getContext('2d');
                
            
            var im = new Image();
            im.src = "data:image/svg+xml,".concat(encodeURIComponent(canvas.toSVG()));
            //draw 
            im.onload = ()=>{ctx.drawImage(im, 0, 0, dim*window.devicePixelRatio, dim*window.devicePixelRatio);}; 
    
            $(document).ready(()=>
            {
                let download = document.createElement('a');
                download.href = tmpCanvas.toDataURL("image/png",1.0);
                download.setAttribute('download', document.title.concat(".png"));
                download.click();
            });
        });
        
        const browseFile=()=>
        {
            //filters
            var filter = new fabric.Image.filters.RemoveWhite({threshold: 40,distance: 140});
            var bw = new fabric.Image.filters.Grayscale();
            var sharp = new fabric.Image.filters.Convolute({matrix:[0,-1,0,-1,5,-1,0,-1,0]});
            
            $(document).on("change","#_imageFile",()=>
            {
                let file = $("#_imageFile").prop("files")[0];
                
                //file size validation
                $("#_url").text(file.size/1000 +"KB" +" - "+file.name);
                if(file.size/1000 > 1000 ) {alert("file is too large, max 1mb");$("#_imageFile").val("");return;};
                
                let reader = new FileReader();
                reader.onload = function (f) 
                {
                    var data = f.target.result;  
                    fabric.Image.fromURL(data, function (img) 
                    {
                        let imSrc = 100;
                        let asp = (img.height/img.width);
                        let mw=img.width,mh=img.height;
    
                        if(img.width > imSrc || img.height > imSrc)
                        { 
                            mw = imSrc;
                            mh = mw * asp;
                        }
                        
                        img.set({left: 200, top: 200, angle: 0,opacity:1.0,width:mw,height:mh});
                        img.filters.push(filter,bw);
                        img.applyFilters();
                        canvas.add(img).renderAll();
                        img.moveTo(0);
                        img.center();
                        canvas.setActiveObject(img);
                        canvas.renderAll();
                    });
                 };
                    reader.readAsDataURL(file);
    
            });
        };
        
        const fontChanger=(a)=> 
        {
            return ["z_swan","z_lucida","z_boli"][a];
        };
        
        //------------------------END HELPER FUNCTIONS----------------------------->
        const serialize=()=>
        {
            $(document).on("click","#_order",()=> 
            { 
                $("#_order").find("span:first").addClass("spinner-border spinner-border-sm");
                doc = parser.parseFromString(getCanvas(),"image/svg+xml");
                const svgExport = svgDown(doc);
                let f = new FormData();
                f.append("schema",document.title); 
                f.append("svg",svgExport);
                f.append("sketch",$("#_imageFile").prop("files")[0]);
    
                var requestOptions = 
                {
                   method: 'POST'
                  ,contentType: "application/x-www-form-urlencoded;charset=UTF-8" 
                  ,body: f
                };
    
                fetch("/saveSvgSketch/".concat(document.title),requestOptions)
                    .then(resp=> resp.json())
                    .then(d=> {$("#_order").find("span:first").removeClass("spinner-border spinner-border-sm");
                                $("#thd").html(`<b class='text-white'>${d.schema}</b>`);
                                $("#tbd").html(`<i class='small'>${d.json}</i>`);$(".toast").toast("show");
                                $("#_url").text(d.json);})
                    .catch(er=> {$("#_order").find("span:first").removeClass("spinner-border spinner-border-sm");
                                $("#thd").html(`<b class='text-white'>ERROR:</b>`);
                                $("#tbd").html(`<i class='small'>${er}</i>`);$(".toast").toast("show");});
            });
        };
        
        const render=(()=>
        {
            init();
            actionButtons();
            zoomCanvas(); //disable if problematic
            config();
            serialize();
            downloadImage();
            browseFile();
        })();
        
    })();