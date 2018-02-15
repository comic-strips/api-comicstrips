function templateModule($imports) {
        const templateMap = {

        }

        function getTemplate(templateName) {
                return templateMap[templateName];
        }

        return { getTemplate };
}

module.exports = templateModule;
