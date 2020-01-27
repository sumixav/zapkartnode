const Logger = require("../../logger");

exports.transformCategory = data => {
    return {
        ...data._doc,
        images: data.images.map(i => this.transformImage(i)),
        seo: this.transformSeo(data.seo)
        // seo: {
        //     pageTitle: page._doc.seo.pageTitle,
        //     pageDescription: page._doc.seo.pageDescription,
        //     pageKeywords: page._doc.seo.pageKeywords
        // }
        // seo: this.transformSeo(page._doc.seo)
    };
};

exports.transformProduct = data => {
    Logger.info(data)
    delete data.shipping_id;
    const compositions = (data.compositions && data.compositions._id) ? {
        deleted: data.compositions.deleted,
        _id: data.compositions._id,
        name: data.compositions.name,
        slug: data.compositions.slug,
    } : data.compositions

    return {
        ...data._doc,
        images: data.images.map(i => this.transformImage(i)),
        brand: { ...data.brand._doc, image: data.brand.image.map(i => this.transformImage(i)) },
        compositions,
        pricing: this.transformPricing(data.pricing),
        category: data.category.map(i => this.transformCategory(i))
    }
}

exports.transformPricing = data => {
    return {
        _id:data._id,
        startDate: data.startDate,
        endDate: data.endDate,
        listPrice: data.listPrice,
        salePrice: data.salePrice,
        taxId: data.taxId,
    }
}

exports.transformImage = data => {
    return {
        _id: data._id,
        url: data.url,
        thumbnail: data.thumbnail,
        width: data.width,
        height: data.height,
        title: data.title
    }
}

exports.transformSeo = data => {
    const { metaTitle,
        metaDescription,
        metaKeywords } = data
    return {
        metaTitle,
        metaDescription,
        metaKeywords
    }
}