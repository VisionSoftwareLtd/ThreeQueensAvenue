import { Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { Location } from '../model/location';
import { LocationService } from '../location.service';
import { LocationPointer } from '../model/location-pointer';

@Component({
  selector: 'app-pan-image-viewer',
  templateUrl: './pan-image-viewer.component.html',
  styleUrls: ['./pan-image-viewer.component.css']
})
export class PanImageViewerComponent implements OnInit {
  private static SCROLL_DELAY = 10;
  private static SCROLL_SPEED = 10;

  @Input('img') imagen: string;
  @Input() lensSize: number = 100;
  @Input() imgHeight: number;
  @Input() bgPosX: number = 0;
  @Input() bgRepeats: boolean = true;
  @Output() locationClickEvent:EventEmitter<LocationPointer> = new EventEmitter<LocationPointer>();
  
  posX: number = 0; // Used for lens
  posY: number = 0; // Used for lens
  scrollXVel: number = 0;
  scrollHandler: NodeJS.Timeout;
  style = {
    'background-image': '',
    'background-repeat': 'repeat',
    'background-position': '0px 0px',
    'background-size': '100px 100px'
  };

  scaledImageWidth: number;
  location: Location;
  bgImagePosX: number; // Debug information only

  constructor(private locationService : LocationService) { }

  ngOnInit(): void {
    this.imgHeight = this.imgHeight ?? 400;
    this.location = this.locationService.getLocation(this.imagen.split("/").pop());
    console.log(`Location filename: ${this.location.filename}`);
    this.setStyle();
  }

  @ViewChild('img', { static: false, read: ElementRef }) img
  @ViewChild('lens', { static: false, read: ElementRef }) lens
  @HostListener('mousemove', ['$event'])
  mouseMove(event: any) {
    this.moveLens(event);
  }

  @HostListener('mouseleave', ['$event'])
  mouseLeave(event: any) {
    this.stopScrolling();
  }

  startScrolling(xVelocity: number) {
    if (this.scrollXVel == xVelocity)
      return;
    if (this.scrollXVel != 0)
      this.stopScrolling();

    this.scrollXVel = xVelocity;
    var that = this;
    this.scrollHandler = setInterval(() => {
      that.bgPosX += that.scrollXVel;
      that.setBackgroundPosition();
    }, PanImageViewerComponent.SCROLL_DELAY);
  }

  setBackgroundPosition() {
    if (this.bgPosX < 0)
      this.bgPosX += this.scaledImageWidth;
    else if (this.bgPosX > this.scaledImageWidth)
      this.bgPosX -= this.scaledImageWidth;
    this.style['background-position'] = `${this.bgPosX}px 0px`;
  }

  stopScrolling() {
    this.scrollXVel = 0;
    clearInterval(this.scrollHandler);
  }

  setStyle() {
    console.log("Setting style");
    this.style['background-image'] = `url(${this.imagen})`;
    this.style['background-repeat'] = this.bgRepeats ? 'repeat' : 'no-repeat';
    this.setImageWidth();
    setTimeout(() => {
      this.setImageWidth();
    }, 50);
  }
  
  setImageWidth() {
    var image = new Image();
    image.src = this.imagen;
    const scalingRatio = this.imgHeight / image.height;
    this.scaledImageWidth = image.width * scalingRatio;
    this.style['background-size'] = `${this.scaledImageWidth}px ${image.height * scalingRatio}px`;
    this.setBackgroundPosition();
  }

  moveLens(e) {
    let pos: { x: any; y: any; };
    let x: number;
    let y: number;
    /*prevent any other actions that may occur when moving over the image:*/
    e.preventDefault();
    /*get the cursor's x and y positions:*/
    pos = this.getCursorPos(e);
    /*calculate the position of the lens:*/
    x = pos.x - (this.lens.nativeElement.offsetWidth / 2);
    y = pos.y - (this.lens.nativeElement.offsetHeight / 2);
    /*prevent the lens from being positioned outside the image:*/
    if (x > this.img.nativeElement.width - this.lens.nativeElement.offsetWidth) { x = this.img.nativeElement.width - this.lens.nativeElement.offsetWidth; }
    if (x < 0) { x = 0; }
    if (y > this.img.nativeElement.height - this.lens.nativeElement.offsetHeight) { y = this.img.nativeElement.height - this.lens.nativeElement.offsetHeight; }
    if (y < 0) { y = 0; }
    if (pos.x < 100)
      this.startScrolling(PanImageViewerComponent.SCROLL_SPEED);
    else if (pos.x < 200)
      this.startScrolling(PanImageViewerComponent.SCROLL_SPEED / 3);
    else if (pos.x > window.innerWidth - 100)
      this.startScrolling(-PanImageViewerComponent.SCROLL_SPEED);
    else if (pos.x > window.innerWidth - 200)
      this.startScrolling(-PanImageViewerComponent.SCROLL_SPEED / 3);
    else
      this.stopScrolling();
    /*set the position of the lens:*/
    this.posX = Math.round(x);
    this.posY = Math.round(y);
    // For debug purposes
    this.bgImagePosX = Math.round(this.posX - this.bgPosX);
    if (this.bgImagePosX < 0)
      this.bgImagePosX += Math.round(this.scaledImageWidth);
  }

  getCursorPos(e) {
    let a, x = 0, y = 0;
    // e = e || window.event;
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

  getWindowWidth() {
    return window.innerWidth;
  }

  onLocationClicked(locationPointer: LocationPointer) {
    if (this.locationClickEvent) {
      this.locationClickEvent.emit(locationPointer);
    }
  }
}
