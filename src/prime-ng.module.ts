import { NgModule } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

export const primeNgServices = [
    MessageService,
    ConfirmationService
]

const primeNgModules = [
    TableModule,
    ChartModule,
    InputSwitchModule,
    ButtonModule,
    TooltipModule,
    SkeletonModule,
    InputTextModule,
    InputTextareaModule,
    InputNumberModule
    // DropdownModule,
    // ToastModule,
    // CheckboxModule,
    // CardModule,
    // DialogModule,
    // StepsModule,
    // DividerModule,
    // ProgressSpinnerModule,
    // DynamicDialogModule,
    // FieldsetModule,

    // ConfirmDialogModule,
    // TabViewModule,
    // MenuModule,
    // OverlayPanelModule,
    // DataViewModule,

    // TagModule,
    // StyleClassModule,
    // PanelModule,
    // SelectButtonModule,

];


@NgModule({
    providers: [
        ...primeNgServices
    ],
    imports: [
        ...primeNgModules
    ],
    exports: [
        ...primeNgModules
    ],
})
export class PrimeNGModule { }