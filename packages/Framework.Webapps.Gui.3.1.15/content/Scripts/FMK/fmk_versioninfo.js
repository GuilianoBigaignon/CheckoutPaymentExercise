if (!window.Fmk) {
    Fmk = {};
}

Fmk.VersionInfo = {
    popup: function() {
        var tpl = '<div id="fmk-versioninfo">' +
            '<div class="fmk-versioninfotitle">{{title}}</div>' +
            '<div class="block-data content"><div class="fmk-loading-black" style="height:150px"></div></div>' +
        '</div>';
        return tpl
            .replace('{{title}}', Fmk.I18n._('Fmk_versioninfo_title', 'Resources', 'WEBAPPS.GUI'));
    },    

    computeVersions: function(params, cbk) {        
        var components = [].concat(params.apis || []).concat(params.guis || []);
        var componentsXhr = components.map(function (c) { return $.getJSON('/' + c + '/version') });
        $.when.apply($, componentsXhr).done(function() {
            var versions = Fmk.Utils.flatten(Fmk.Utils.retrieveMultipleXhrResults(arguments));
            cbk && cbk(versions);
        });
    },

    display: function (params) {
        $('#fmk-versioninfo').remove();

        $(Fmk.VersionInfo.popup()).appendTo('body')
        .jqxWindow({
            height: 200,
            width: 300,
            isModal: true,
            draggable: false,
            resizable: false,
            autoOpen: true
        });

        Fmk.VersionInfo.computeVersions(params, function (versions) {
            var content = '<table class="data-list"><tbody>' + Fmk.VersionInfo.buildVersionsTpl(versions) + '</tbody></table>';
            $('#fmk-versioninfo .content').html(content);

            var newHeight = $('#fmk-versioninfo table.data-list').height() + 50;
            var newPos = (window.innerHeight - newHeight) / 2;
 
            $('#fmk-versioninfo').jqxWindow({ height: newHeight, position: { x: 'center', y: newPos } });
        });
    },

    buildVersionsTpl: function (versions) {
        return versions.map(function (v) {
            var tpl = '<tr><td><p class="data-list__title">{{application}}</p></td><td>{{version}}</td></tr>';

            return tpl
                .replace('{{application}}', v.application)
                .replace('{{version}}', v.version);
        }).join('');
    },
}

//Version Info item
$.fn.fmkChooseScreenVersionInfo = function(versions) {
    return {
        id: 'versioninfo',
        label: Fmk && Fmk.I18n && Fmk.I18n._('Fmk_Application_Versions', 'Resources', 'WEBAPPS.GUI'),
        icon: 'info',
        select: function (event) {
            Fmk.VersionInfo.display(versions);
        }
    };
};