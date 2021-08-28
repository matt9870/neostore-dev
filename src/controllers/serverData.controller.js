const serverDataModel = require('../models/serverData.model');


//array format
exports.addProductCategories = async (req, res) => {
    try {
        if (req.body && req.body.productCategories.length > 0) {
            const data = await serverDataModel.find({});
            let newProductCategories = req.body.productCategories;

            if (!data.length) {
                const serverData = new dataModel({
                    productCategories: newProductCategories
                })
                serverData.save(serverData).then((savedData) => {
                    console.log(savedData);
                    res.status(200).send({
                        msg: `new object created with given product categories`,
                        savedData
                    })
                }).catch(err => {
                    console.log(err);
                    res.status(400).send({
                        err
                    })
                })
            }
            else {
                var serverDataId = data[0]._id;
                let serverData = await serverDataModel.findById(serverDataId);
                // console.log(serverData);
                let duplicateCategories = 0, newCategories = 0, message = ``;

                newProductCategories.forEach(category => {
                    category = category.toLowerCase();
                    if (!serverData.productCategories.includes(category)) {
                        newCategories++;
                        serverData.productCategories.push(category);
                    }
                    else duplicateCategories++;
                });

                if (newCategories === 0) {
                    message = `provided existing categories. no changed made to database`
                    res.status(200).send({
                        message
                    })
                    return;
                }
                else {
                    message = `${newCategories} categories added. ${duplicateCategories} duplicate categories found and avoided`;
                    // console.log(serverData);
                    serverData.save(serverData).then(savedData => {
                        res.status(200).send({
                            message,
                            savedData
                        })
                    }).catch(err => {
                        console.log(err);
                        res.status(400).send({
                            err
                        })
                    })
                }

            }
        }
        else
            res.status(400).send({
                msg: 'Should provide atleat one product category to proceed'
            })
    } catch (error) {
        console.log(error);
    }

}

exports.getProductCategories = async (req, res) => {

    var data = await serverDataModel.find({});
    data = data[0];

    res.status(200).send({
        msg: 'Returning data',
        data
    })

}