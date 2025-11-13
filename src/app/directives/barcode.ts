import { Directive, ElementRef, Input, OnChanges, inject } from '@angular/core';
import JsBarcode from 'jsbarcode';

@Directive({
  selector: '[appBarcode]',
  standalone: true
})
export class BarcodeDirective implements OnChanges {
  private el = inject(ElementRef);

  @Input() appBarcode: string = '';
  @Input() format: string = 'CODE128';
  @Input() width: number = 1.5;
  @Input() height: number = 40;
  @Input() displayValue: boolean = false;

  ngOnChanges() {
    this.generateBarcode();
  }

  private generateBarcode() {
    if (this.appBarcode && this.appBarcode !== 'N/A') {
      try {
        // Limpiar el contenido anterior
        this.el.nativeElement.innerHTML = '';
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.el.nativeElement.appendChild(svg);
        
        JsBarcode(svg, this.appBarcode, {
          format: this.format,
          width: this.width,
          height: this.height,
          displayValue: this.displayValue,
          margin: 0
        });
      } catch (error) {
        console.error('Error generating barcode:', error);
        this.el.nativeElement.innerHTML = this.appBarcode;
      }
    } else {
      this.el.nativeElement.innerHTML = 'N/A';
    }
  }
}