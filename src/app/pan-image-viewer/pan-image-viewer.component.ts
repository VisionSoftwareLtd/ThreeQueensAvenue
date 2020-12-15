import { Component, ElementRef, HostListener, Input, OnInit, Renderer2, ViewChild } from '@angular/core';

@Component({
  selector: 'app-pan-image-viewer',
  templateUrl: './pan-image-viewer.component.html',
  styleUrls: ['./pan-image-viewer.component.css']
})
export class PanImageViewerComponent implements OnInit {

  @Input('img') imagen: string;
  @Input() zoom=2;
  @Input() lensSize=40;
  @Input() imgWidth;
  @Input() imgHeigth;
  @Input() divZoomed:ElementRef;

  posX:number=0;
  posY:number=0;
  cx:number=1;
  cy:number=1;
  yet:boolean=false;
  factorX:number;
  factorY:number;
  
  constructor(private renderer: Renderer2) { }

  ngOnInit(): void {
  }

  @ViewChild('img',{static:false, read:ElementRef}) img
  @ViewChild('lens',{static:false, read:ElementRef}) lens
  @HostListener('mousemove', ['$event'])
  mouseMove(event:any) {
    const result = this.moveLens(event);
    this.renderer.setStyle(this.divZoomed, 'background-position', result);
  }

  onLoad() {
    this.renderer.setStyle(this.divZoomed,'background-image',"url('" + this.imagen+ "')");
    this.renderer.setStyle(this.divZoomed,'background-size',(this.img.nativeElement.width * this.zoom) + "px " + (this.img.nativeElement.height * this.zoom) + "px")
    this.renderer.setStyle(this.divZoomed,'background-repeat', 'no-repeat')
    this.renderer.setStyle(this.divZoomed, 'transition', 'background-position .2s ease-out');
    this.factorX = this.img.nativeElement.width;
    this.factorY = this.img.nativeElement.height;

    this.yet = true;
    setTimeout(() => {
      this.factorX = this.imgWidth || this.imgHeigth ? this.factorX / this.img.nativeElement.width : 1
      this.factorY = this.imgWidth || this.imgHeigth ? this.factorY / this.img.nativeElement.height : 1
      const dim = (this.divZoomed as any).getBoundingClientRect()
      this.cx = (dim.width - this.img.nativeElement.width * this.zoom * this.factorX) / (this.img.nativeElement.width - this.lens.nativeElement.offsetWidth);
      this.cy = (dim.height - this.img.nativeElement.height * this.zoom * this.factorY) / (this.img.nativeElement.height -
        this.lens.nativeElement.offsetHeight);
    });
  }

  moveLens(e) {
    let pos
    let x
    let y;
    /*prevent any other actions that may occur when moving over the image:*/
    e.preventDefault();
    /*get the cursor's x and y positions:*/
    pos = this.getCursorPos(e);
    /*calculate the position of the lens:*/
    x = pos.x - (this.lens.nativeElement.offsetWidth / 2);
    y = pos.y - (this.lens.nativeElement.offsetHeight / 2);
    /*prevent the lens from being positioned outside the image:*/
    if (x > this.img.nativeElement.width - this.lens.nativeElement.offsetWidth) {x = this.img.nativeElement.width - this.lens.nativeElement.offsetWidth;}
    if (x < 0) {x = 0;}
    if (y > this.img.nativeElement.height - this.lens.nativeElement.offsetHeight) {y = this.img.nativeElement.height - this.lens.nativeElement.offsetHeight;}
    if (y < 0) {y = 0;}
    /*set the position of the lens:*/
    this.posX = x;
    this.posY = y;
    /*display what the lens "sees":*/

    let result = (x * this.cx) + "px "+(y * this.cy) + "px"

    return result;
  }

  getCursorPos(e) {
    var a, x = 0, y = 0;
    e = e || window.event;
    /* Get the x and y positions of the image: */
    a = this.img.nativeElement.getBoundingClientRect();
    /* Calculate the cursor's x and y coordinates, relative to the image: */
    x = e.pageX - a.left;
    y = e.pageY - a.top;
    /* Consider any page scrolling: */
    x = x - window.pageXOffset;
    y = y - window.pageYOffset;
    return { x: x, y: y };
  }
}
