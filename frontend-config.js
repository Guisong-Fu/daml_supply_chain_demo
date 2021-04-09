/*
 * Copyright (c) 2019, Digital Asset (Switzerland) GmbH and/or its affiliates. All rights reserved.
 * SPDX-License-Identifier: Apache-2.0
 */
import { DamlLfValue } from '@da/ui-core';

export const version = {
    schema: 'navigator-config',
    major: 2,
    minor: 0
};

// --- Creating views --------------------------------------------------------------------

const customerOrderRequestView = createTab("Customer Order Request", ":CustomerManufacturerOrderRequest@", [
    createIdCol(),
    createCol("customer", "Customer"),
    createCol("manufacturer", "Manufacturer"),
    createCol("products", "Products", 80, r => r.products.map(p => p.quantity + " " + p.productName).join(', '))
]);

const manufacturerAcceptCustomerRequestView = createTab("Manufacturer Accept Request", ":CustomerManufacturerOrderRequestAccepted@", [
    createIdCol(),
    createCol("workflowId", "WorkflowId"),
    createCol("customer"),
    createCol("manufacturer")
]);

const manufacturerSupplierOrderRequestView = createTab("Manufacturer Supplier Request", ":ManufacturerSupplierOrderRequest@", [
    createIdCol(),
    createCol("manufacturer"),
    createCol("supplier", "Supplier"),
    createCol("products", "Products", 80, r => r.products.map(p => p.quantity + " " + p.productName).join(', '))
]);


const supplierAcceptManufacturerRequestView = createTab("Supplier Accept Request", ":ManufacturerSupplierOrderRequestAccepted@", [
    createIdCol(),
    createCol("workflowId"),
    createCol("supplier"),
    createCol("manufacturer")
]);


const supplierDeliverToManufacturerView = createTab("Supplier Deliver Product", ":DeliverToManufacturer@", [
    createIdCol(),
    createCol("supplier"),
    createCol("manufacturer"),
    createCol("deliveryNote")
]);



const manufacturerWorkshopOrderRequestView = createTab("Manufacturer Workshop Request", ":ManufacturerSendRequestToWorkshop@", [
    createIdCol(),
    createCol("manufacturer"),
    createCol("workshop", "Workshop"),
    createCol("products", "Products", 80, r => r.products.map(p => p.quantity + " " + p.productName).join(', '))
]);


const workshopManufacturerDeliveryView = createTab("Workshop Deliver", ":WorkshopFinishSendToManufacturer@", [
    createIdCol(),
    createCol("workshop"),
    createCol("manufacturer"),
    createCol("workshopNote", "Workshop Note")
]);


const customerAcceptProductView = createTab("Customer Accept Product", ":ManufacturerCustomerDelivery@", [
    createIdCol(),
    createCol("manufacturer"),
    createCol("customer"),
    createCol("deliveryNote", "Delivery Note")
]);

// --- Assigning vievs to parties --------------------------------------------------------------------

export const customViews = (userId, party, role) => {
    if (party == 'Customer') {
        return {
            customerOrderRequestView,
            customerAcceptProductView,
            customerAcceptProductView,
        };
    } else if (party == 'Manufacturer') {
        return {
            customerOrderRequestView,
            manufacturerAcceptCustomerRequestView,
            manufacturerSupplierOrderRequestView,
            supplierDeliverToManufacturerView,
            manufacturerWorkshopOrderRequestView,
            workshopManufacturerDeliveryView,
            customerAcceptProductView,
        }
    } else if (party == 'Workshop') {
        return {
            manufacturerWorkshopOrderRequestView,
            workshopManufacturerDeliveryView,
        }
    } else if (party == "Supplier") {
        return {
            manufacturerSupplierOrderRequestView,
            supplierAcceptManufacturerRequestView,
            supplierDeliverToManufacturerView,
        }
    } else {
        return {
        };
    }
}






// --- Helpers --------------------------------------------------------------------

/**
 title, width and proj are optional
 if proj is null and key is "id" then it will default to the contract id
 if proj is null and key is not "id" then it will default to stringified single or array value of rowData.key
*/
function createCol(key, title = toTitle(key), width = 80, proj) {
    return {
        key: key,
        title: title,
        createCell: ({ rowData }) => ({
            type: "text",
            value: valueFunction(rowData, key, proj)
        }),
        sortable: true,
        width: width,
        weight: 0,
        alignment: "left"
    };
}

function createIdCol() {
    return createCol("id", "Contract ID", 60);
}

function createTab(name, templateId, columns, additionalFilter) {
    var filter;
    if (additionalFilter == null) {
        filter =
        [
            {
                field: "template.id",
                value: templateId
            }
        ]
    } else {
        filter =
        [
            {
                field: "template.id",
                value: templateId
            },
            additionalFilter
        ]
    }
    return {
        type: "table-view",
        title: name,
        source: {
            type: "contracts",
            filter: filter,
            search: "",
            sort: [
                {
                    field: "id",
                    direction: "ASCENDING"
                }
            ]
        },
        columns: columns
    };
}


function formatIfNum(val) {
    var n = Number(val);
    if (Number.isNaN(n)) return val;
    else return n.toLocaleString();
}

function valueFunction(rowData, key, proj) {
    return (
        proj == null
        ?
        (
            Array.isArray(DamlLfValue.toJSON(rowData.argument)[key])
            ?
            DamlLfValue.toJSON(rowData.argument)[key].join(", ")
            :
            (
                key == "id"
                ?
                rowData.id
                :
                formatIfNum(DamlLfValue.toJSON(rowData.argument)[key])
            )
        )
        :
        formatIfNum(proj(DamlLfValue.toJSON(rowData.argument))));
}

// inserts spaces into the usually camel-case key
// e.g. "assetISINCode" -> "Asset ISIN Code"
function toTitle(key) {
    var spaced = key.replace(/([^A-Z])([A-Z])/g, '$1 $2').replace(/([A-Z])([A-Z][^A-Z])/g, '$1 $2');
    return spaced[0].toUpperCase() + spaced.substr(1)
}
