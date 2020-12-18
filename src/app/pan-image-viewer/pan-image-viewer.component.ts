import { Component, ElementRef, HostListener, Input, OnInit, Output, ViewChild, EventEmitter, SimpleChanges } from '@angular/core';
import { Location } from '../model/location';
import { LocationService } from '../location.service';
import { LocationPointer } from '../model/location-pointer';
import { ClipboardService } from 'ngx-clipboard';

@Component({
  selector: 'app-pan-image-viewer',
  templateUrl: './pan-image-viewer.component.html',
  styleUrls: ['./pan-image-viewer.component.css']
})
export class PanImageViewerComponent implements OnInit {
  private static SCROLL_DELAY = 10;
  private static SCROLL_SPEED = 12;

  @Input('img') imagen: string;
  @Input() imgHeight: number = 400;
  @Input() bgPosX: number = 0;
  @Output() locationClickEvent:EventEmitter<LocationPointer> = new EventEmitter<LocationPointer>();
  
  posX: number = 0;
  posY: number = 0;
  scrollXVel: number = 0;
  scrollHandler: NodeJS.Timeout;
  style = {
    'background-image': '',
    'background-repeat': 'repeat',
    'background-position': '0px 0px',
    'background-size': '100px 100px'
  };

  scalingRatio: number = 1;
  scaledImageWidth: number = 0;
  location: Location;
  bgImagePosX: number = 0;
  bgImagePosY: number = 0;
  bgRepeats: boolean = true;
  bgXOffsetForCentredImage: number = 0;

  constructor(private locationService: LocationService, private clipboardService: ClipboardService) { }

  ngOnInit(): void {
    this.loadImage();
  }

  loadImage() {
    this.location = this.locationService.getLocation(this.imagen.split("/").pop());
    if (this.location === undefined) {
      console.log(`ERROR: No entry in locations.json for ${this.imagen.split("/").pop()}`)
      alert('Error!  Contact ThreeQueensAvenue support :)');
      return;
    }
    this.bgRepeats = this.location.scrollingImage;
    this.setStyle();
  }

  setStyle() {
    this.style['background-image'] = `url(${this.imagen})`;
    this.style['background-repeat'] = this.bgRepeats ? 'repeat' : 'no-repeat';
    this.setImageWidth();
  }

  setImageWidth() {
    var image = new Image();
    var that = this;
    image.onload = function() {
      that.scalingRatio = that.imgHeight / image.height;
      that.scaledImageWidth = image.width * that.scalingRatio;
      that.style['background-size'] = `${that.scaledImageWidth}px ${image.height * that.scalingRatio}px`;
      that.setBackgroundPosition();
      if (that.location.isPointOfInterest) {
        that.setReturnPointerDiv(image);
      }
    };
    image.src = this.imagen;
  }

  setReturnPointerDiv(image: HTMLImageElement) {
    var locationPointer = this.location.locationPointers.pop();
    locationPointer.width = image.width;
    locationPointer.height = image.height;
    this.location.locationPointers.push(locationPointer);
  }

  updateImage(filepath: string, newBgPosX = 0) {
    this.imagen = filepath;
    this.bgPosX = newBgPosX;
    this.loadImage();
  }

  @ViewChild('img', { static: false, read: ElementRef }) img
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
    if (this.location.scrollingImage) {
      if (this.bgPosX < 0)
        this.bgPosX += this.scaledImageWidth;
      else if (this.bgPosX > this.scaledImageWidth)
        this.bgPosX -= this.scaledImageWidth;
      this.bgPosX = Math.round(this.bgPosX);
      this.bgXOffsetForCentredImage = 0;
    } else {
      // Don't use this.style['background-position'] = 'center';
      // Instead, set bgXOffsetForCentredImage manually as the x/y pos of the cursor relies on this.bgXOffsetForCentredImage being set correctly
      this.bgXOffsetForCentredImage = window.innerWidth / 2 - this.scaledImageWidth / 2;
    }
    this.style['background-position'] = `${this.bgPosX + this.bgXOffsetForCentredImage}px 0px`;
  }

  stopScrolling() {
    this.scrollXVel = 0;
    clearInterval(this.scrollHandler);
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
    x = pos.x;
    y = pos.y;

    if (x > this.img.nativeElement.width) { x = this.img.nativeElement.width; }
    if (x < 0) { x = 0; }
    if (y > this.img.nativeElement.height) { y = this.img.nativeElement.height; }
    if (y < 0) { y = 0; }
    if (this.location.scrollingImage) {
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
    }
    /*set the position of the lens:*/
    this.posX = Math.round(x);
    this.posY = Math.round(y);
    this.posX -= this.bgXOffsetForCentredImage;

    this.bgImagePosX = this.posX - this.bgPosX;
    if (this.bgImagePosX < 0)
      this.bgImagePosX += this.scaledImageWidth;
    this.bgImagePosX /= this.scalingRatio;
    this.bgImagePosY = this.posY / this.scalingRatio;
    this.bgImagePosX = Math.round(this.bgImagePosX);
    this.bgImagePosY = Math.round(this.bgImagePosY);
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
      this.stopScrolling();
      const otherLocation = this.locationService.getLocation(locationPointer.filename);
      if (otherLocation.isPointOfInterest) {
        otherLocation.locationPointers[0].newBgPosX = this.bgPosX;
        otherLocation.locationPointers[0].filename = this.location.filename;
      }
      this.locationClickEvent.emit(locationPointer);
    }
  }

  isPointOfInterest(locationPointer: LocationPointer) {
    const otherLocation = this.locationService.getLocation(locationPointer.filename);
    return otherLocation.isPointOfInterest;
  }

  private copyTop: number;
  private copyLeft: number;
  private copyWidth: number;
  private copyHeight: number;
  private isCopying: boolean = false;

  onClickNoDiv() {
    if (!this.isCopying) {
      this.copyTop = this.bgImagePosY;
      this.copyLeft = this.bgImagePosX;
    } else {
      this.copyWidth = this.bgImagePosX - this.copyLeft;
      this.copyHeight = this.bgImagePosY - this.copyTop;
      this.clipboardService.copy(`"top": ${this.copyTop},\n"left": ${this.copyLeft},\n"width": ${this.copyWidth},\n"height": ${this.copyHeight},`);
      console.log('Copied');
    }
    this.isCopying = !this.isCopying;
  }

  // @Input() lensSize: number = 100;
  // @ViewChild('lens', { static: false, read: ElementRef }) lens
  // if (x > this.img.nativeElement.width - this.lens.nativeElement.offsetWidth) { x = this.img.nativeElement.width - this.lens.nativeElement.offsetWidth; }
  // if (x < 0) { x = 0; }
  // if (y > this.img.nativeElement.height - this.lens.nativeElement.offsetHeight) { y = this.img.nativeElement.height - this.lens.nativeElement.offsetHeight; }
  // if (y < 0) { y = 0; }
}
