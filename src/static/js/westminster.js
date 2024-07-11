$(document).ready(function () {
    jscolor.installByClassName("jscolor");
    addParty(newcolor = "#AD1FFF");

    $(".sortableContainer").each(function (index, liz) {
        const jliz = $(liz);
        jliz.sortable({
            handle: ".handle",
            containment: jliz.parents(".card"),
            opacity: .7,
            revert: 30,
            tolerance: "pointer",
        });
    });
});

function addParty(newcolor = "") {
    // Party list <div> where dynamic content will be placed
    const partylistcontainer = document.getElementById("partylistcontainer");

    //New party's number: one more than the largest party number so far:
    let i = 0;
    $("div").each(function () {
        if (this.id.match(/^party[0-9]+$/)) {
            i = Math.max(i, parseInt(/[0-9]+$/.exec(this.id)[0]));
        }
    });
    i++;

    const partycard = partylistcontainer.appendChild(document.createElement('div'));
    partycard.id = "party" + i;
    partycard.className = "card partycard";

    const newpartydiv = partycard.appendChild(document.createElement('div'));
    newpartydiv.className = "card-body";

    // Ordering handle
    const mover = newpartydiv.appendChild(document.createElement('span'));
    mover.className = 'handle btn btn-secondary';
    mover.innerHTML = '☰';
    Object.assign(mover.style, {
        cursor: "move",
        "font-size": "30px",
        position: 'absolute',
        right: '20px',
        top: '50%',
        transform: 'translateY(-50%)', // yalign .5
        padding: '0 10px',
    });

    // Party name label
    const partytitle = document.createElement('div');
    partytitle.className = 'left';
    partytitle.innerHTML = "Party " + i + " name";
    newpartydiv.appendChild(partytitle);

    let input;
    // Party name input control
    input = document.createElement('div');
    input.innerHTML = `<input class="right" type="text" name="Name${i}" value="Party ${i}">`;
    newpartydiv.appendChild(input);

    // Party support name tag
    const partysupport = document.createElement('div');
    partysupport.className = 'left';
    partysupport.innerHTML = `Party ${i} delegates`;
    newpartydiv.appendChild(partysupport);

    // Party support input control
    input = document.createElement('div');
    input.innerHTML = `<input class="right" type="number" name="Number${i}" value="${i}">`;
    newpartydiv.appendChild(input);

    // Party group name tag
    const partygroup = document.createElement('div');
    partygroup.className = 'left';
    partygroup.innerHTML = `Party ${i} group`;
    newpartydiv.appendChild(partygroup);

    // Party group input control
    input = document.createElement('div');
    input.innerHTML = `<select class="right" name="Group${i}">
        <option value="left">Left</option>
        <option value="right">Right</option>
        <option value="center">Cross-bench</option>
        <option value="head">Speaker</option>
    </select>`;
    newpartydiv.appendChild(input);

    // Party color name tag
    const partycolor = document.createElement('div');
    partycolor.className = 'left';
    partycolor.innerHTML = `Party ${i} color`;
    newpartydiv.appendChild(partycolor);

    // Party color input control
    input = document.createElement('div');
    if (newcolor == "") { newcolor = getRandomColor() }
    input.innerHTML = `<input class="right jscolor" type="text" name="Color${i}" value="${newcolor}">`;
    newpartydiv.appendChild(input);

    // Delete button
    const delbutton = document.createElement('button');
    delbutton.className = 'btn btn-danger';
    delbutton.innerHTML = `Delete party ${i}`;
    delbutton.setAttribute("onClick", `deleteParty(${i})`);
    newpartydiv.appendChild(delbutton);
    // Add a newline
    newpartydiv.appendChild(document.createElement("br"));
    jscolor.installByClassName("jscolor");
}

function CallDiagramScript() {
    // Create request payload
    const payload = {
        radius: Math.max(0, parseFloat($("input[name^='radius']").val())),
        spacing: Math.max(0, Math.min(parseFloat($("input[name^='spacing'").val()), .99)),
        wingrows: Math.max(0, parseInt($("input[name^='wingrows']").val())),
        centercols: Math.max(0, parseInt($("input[name^='centercols']").val())),
        fullwidth: new Boolean($("input[name^='fullwidth']").prop("checked")),
        cozy: new Boolean($("input[name^='cozy']").prop("checked")),
        parties: [],
    };

    const partylist = payload.parties;

    // Create legend string: this is a Wikipedia markup legend that can be pasted into an article.
    let legendstring = "";
    //this variable will hold the index of the party with the biggest support: used for creating an auto-speaker spot.
    let bigparty = 0;
    let bigpartysize = 0;
    let totalseats = 0; //count total seats to check for empty diagram
    $(".partycard").each(function () {
        const jme = $(this);
        const index = partylist.length;

        const party = {
            name: jme.find("input[name^='Name']").val(),
            num: Math.max(1, parseInt(jme.find("input[name^='Number']").val())),
            group: jme.find("select[name^='Group']").val(),
            color: "#" + jme.find("input[name^='Color']").val(),
        };

        if (party.num > bigpartysize) {
            bigparty = index;
            bigpartysize = party.num;
        }

        partylist.push(party);

        totalseats += party.num;

        if (party.group !== "head") {
            legendstring += `{{legend|${party.color}|${party.name}: ${party.num} seat`
            if (party.num !== 1) {
                legendstring += 's';
            }
            legendstring += '}} ';
        }
    });

    const autospeaker = Math.max(0, parseInt($("input[name^='autospeaker']").val()));
    if (autospeaker) {
        partylist.push({
            name: partylist[bigparty].name,
            num: autospeaker,
            group: "head",
            color: '#' + partylist[bigparty].color
        });
        totalseats += autospeaker;
    }

    if (totalseats > 0) {
        //Now post the request to the script which actually makes the diagram.
        const requeststring = JSON.stringify(payload);
        $.ajax({
            type: "POST",
            url: "westminster.py",
            data: { data: requeststring },
        }).done(function (data, status) {
            data = data.trim();

            // Show the default-hidden div
            $("#togglablepost").show();

            // This will get the first node with id "newdiag"
            const newdiag = document.getElementById("newdiag");

            const newdiag = newdiag.insertBefore(document.createElement('p'), newdiag.firstChild);

            // Now add the svg image to the page
            const img = document.createElement("img");
            img.src = data;
            newdiag.appendChild(img);
            // and a linebreak
            newdiag.appendChild(document.createElement("br"));

            // Add a link with the new diagram
            const a = document.createElement('a');
            a.className = "btn btn-success";
            a.append("Click to download your SVG diagram.");
            a.title = "SVG diagram";
            a.href = data;
            a.download = data;
            newdiag.appendChild(a);
            // and a linebreak
            newdiag.appendChild(document.createElement("br"));

            // Now add the legend template text with the party names, colours and support.
            newdiag.appendChild(document.createElement('h4'))
                .append("Legend template for use in Wikipedia:");
            newdiag.append(legendstring);
            newdiag.appendChild(document.createElement("hr"));

            // File upload name label
            const filenametitle = document.createElement('div');
            filenametitle.className = 'left greendiv';
            filenametitle.innerHTML = "Filename to upload:";
            newdiag.appendChild(filenametitle);

            // File upload name input control
            let input = document.createElement('div');
            input.innerHTML = '<input class="right" type="text" name="' + data.replace(/.*\//, '').replace(/.svg\s*$/, '') + '" id="inputFilename" value= "My_Parliament.svg" >';
            newdiag.appendChild(input);

            // Year label
            let yeartitle = document.createElement('div');
            yeartitle.className = 'left greendiv';
            yeartitle.innerHTML = "Election year:";
            newdiag.appendChild(yeartitle);

            // Year input control
            input = document.createElement('div');
            input.innerHTML = '<input class="right" type="number" name="year" id="year" min="0" max="' + (new Date()).getFullYear() + '" value=' + (new Date()).getFullYear() + ' oninput="updateFilename()" >';
            newdiag.appendChild(input);

            // Country label
            const countrytitle = document.createElement('div');
            countrytitle.className = 'left greendiv';
            countrytitle.innerHTML = "Country:";
            newdiag.appendChild(countrytitle);

            // Country input control
            input = document.createElement('div');
            input.innerHTML = '<input class="right" type="text" name="country" id="country" value=""  oninput="updateFilename()">';
            newdiag.appendChild(input);

            // Locality label
            const localitytitle = document.createElement('div');
            localitytitle.className = 'left greendiv';
            localitytitle.innerHTML = "Locality:";
            newdiag.appendChild(localitytitle);

            // Locality input control
            input = document.createElement('div');
            input.innerHTML = '<input class="right" type="text" name="locality" id="locality" value=""  oninput="updateFilename()">';
            newdiag.appendChild(input);

            // Body label
            const bodytitle = document.createElement('div');
            bodytitle.className = 'left greendiv';
            bodytitle.innerHTML = "Body (e.g. Town Council, Bundestag or Senate):";
            newdiag.appendChild(bodytitle);

            // Body input control
            input = document.createElement('div');
            input.innerHTML = '<input class="right" type="text" name="body" id="body" value="Parliament" oninput="updateFilename()">';
            newdiag.appendChild(input);
            newdiag.appendChild(document.createElement("br"));

            // Button to add a link to upload the new diagram
            const uploadwarn = document.createElement('div');
            uploadwarn.className = 'notice';
            uploadwarn.innerHTML = "This image is for a real-world body or a notable work of fiction and I want to upload it to Commons.<br />I understand that images uploaded for private use can be deleted without notice and can lead to my username being blocked.";
            newdiag.appendChild(uploadwarn);

            if (oauth_enabled) {
                const uploadlinkbutton = document.createElement('a');
                uploadlinkbutton.className = 'btn btn-primary';
                uploadlinkbutton.setAttribute("onClick", 'makeUploadLink("' + data + '", "' + legendstring + '")');
                uploadlinkbutton.append("Generate upload link");
                newdiag.appendChild(uploadlinkbutton);
                // and a linebreak
                newdiag.appendChild(document.createElement("br"));
            }
        }).fail(function (xhr, textStatus, errorThrown) {
            // data doesn't contain "svg", so post an error message instead

            // This will get the first node with id "newdiag"
            const newdiag = document.getElementById("newdiag");

            // Remove old images
            while (newdiag.hasChildNodes()) {
                newdiag.removeChild(newdiag.lastChild);
            }

            // This is the new newdiag that will hold our stuff.
            const newpost = document.createElement("div");
            newdiag.appendChild(newpost);

            const errordiv = document.createElement("div");
            errordiv.id = "error";
            errordiv.className = "error";
            errordiv.append(
                "Oops, your diagram wasn't successfully generated!",
                document.createElement("br"),
                "(" + textStatus + ", " + errorThrown + ")",
                document.createElement("br"),
                "Please raise a ",
            );
            const bugreportlink = document.createElement("a");
            bugreportlink.href = "https://github.com/slashme/parliamentdiagram/issues/new";
            bugreportlink.append("bug report");
            errordiv.appendChild(bugreportlink);
            errordiv.append(".");
            newpost.appendChild(errordiv);
            // add a linebreak
            newpost.appendChild(document.createElement("br"));

            // Even though we failed, still add the legend template text with the party names, colours and support.
            newpost.appendChild(document.createElement('h4'))
                .append("Legend template for use in Wikipedia:");
            newpost.appendChild(document.createElement("br"));
            newpost.appendChild(document.createTextNode(legendstring));
        });
        console.log(requestJSON);
        console.log(legendstring);
    } else {
        alert("There are no delegates in your parliament. Cannot generate a diagram!");
    }
}

function updateFilename() {
    const filenameElements = [];
    let country, locality, body, year;
    if (country = document.getElementById("country").value) {
        filenameElements.push(country);
    }
    if (locality = document.getElementById("locality").value) {
        filenameElements.push(locality);
    }
    if (body = document.getElementById("body").value) {
        filenameElements.push(body);
    }
    if (year = document.getElementById("year").value) {
        filenameElements.push(year);
    }

    let newFilename = "";
    if (filenameElements.length > 0) {
        newFilename = filenameElements.join("_");
    } else {
        newFilename = "My_Parliament";
    }
    newFilename += ".svg";

    document.getElementById("inputFilename").value = newFilename;
}

function makeUploadLink(linkdata, legendtext) {
    if (!oauth_enabled) {
        alert("OAuth is not enabled on this server.");
        return;
    }

    // check if the oauth is logged in
    // if not, request to check
    // if still not, instead of adding an upload button, add a newtab login button
    // so when the user comes back, a click on "generate upload link" will pass the query check
    if (!username) {
        $.ajax({
            url: "get_username",
            async: false, // very important, otherwise the if below will be taken before the done function runs
        }).done(function (data) {
            username = data["username"].toString(); // force an error if undefined
        }).fail(function () {
            throw new Error("OAuth is enabled but an error occurred when retrieving the username.");
        });
    }
    const buttonlocation = document.getElementById("newdiagbutton");
    if (username) {
        const fname = document.getElementById("inputFilename").value.replace(/(.svg)*$/i, ".svg");

        const uploadbutton = document.createElement('button');
        uploadbutton.id = "uploadbutton";
        uploadbutton.className = 'btn btn-primary';
        uploadbutton.setAttribute("onClick", 'postToUpload("' + fname + '", "' + linkdata + '", "' + legendtext + '", ignore=false)');
        uploadbutton.append("Click to upload " + fname + " to Wikimedia Commons");

        buttonlocation.innerHTML = "";
        buttonlocation.append(uploadbutton);
    } else {
        const loginbutton = document.createElement('a');
        loginbutton.id = "uploadloginbutton";
        loginbutton.className = 'btn btn-primary';
        loginbutton.href = "login";
        loginbutton.setAttribute("target", "_blank");
        loginbutton.append("Login to Wikimedia Commons");
        // TODO: if possible the callback should redirect to a page that closes the tab
        loginbutton.setAttribute("onClick", 'document.getElementById("uploadloginbutton").remove();');

        buttonlocation.innerHTML = "";
        buttonlocation.append(loginbutton);
    }
}

function postToUpload(fname, linkdata, legendtext, ignore = false) {
    // deactivate the button during processing
    const uploadbutton = document.getElementById("uploadbutton");
    uploadbutton.disabled = true;

    const today = (new Date()).toISOString().split("T")[0];
    $.ajax({
        type: "POST",
        url: "commons_upload",
        data: {
            uri: linkdata,
            filename: fname,
            pagecontent: encodeURIComponent("== {{int:filedesc}} ==\n{{Information\n|description = " + legendtext + "\n|date = " + today + "\n|source = [https://parliamentdiagram.toolforge.org/archinputform Parliament diagram tool]\n|author = [[User:{{subst:REVISIONUSER}}]]\n|permission = {{PD-shape}}\n|other versions =\n}}\n\n[[Category:Election apportionment diagrams]]\n"),
            ignorewarnings: ignore,
        },
    }).done(function (data) {
        let force_removebutton = false;
        let retry_ignore = false;

        // It is possible that the request returns both warnings and a successful result,
        // but assuming it's only in the case of ignorewarnings=true, the warnings are not shown
        if (data.upload && (data.upload.result === "Success")) {
            // Success
            const successdiv = document.createElement('div');
            successdiv.className = 'success';
            successdiv.append("Image successfully uploaded on ");
            const a = successdiv.appendChild(document.createElement("a"));
            try {
                a.href = data.upload.imageinfo.descriptionurl;
            } catch (e) {
                a.href = "https://commons.wikimedia.org/wiki/File:" + fname.replace(" ", "_");
            }
            a.setAttribute("target", "_blank");
            a.append("Commons");
            successdiv.append(".");
            uploadbutton.parentElement.appendChild(successdiv);

            force_removebutton = true;
        } else if (data.error) {
            // WM error case
            // alert(`Error (code "${data.error.code}"): " + ${data.error.info}`);
            const errordiv = document.createElement('div');
            errordiv.className = 'error';
            uploadbutton.parentElement.appendChild(errordiv);

            force_removebutton = true;

            if (data.error.code === "mwoauth-invalid-authorization") {
                $.ajax({
                    type: "POST",
                    url: "logout",
                });
                errordiv.append(
                    "You need to (re-)authorize the tool to upload files on your behalf.",
                    document.createElement("br"),
                );
                const a = errordiv.appendChild(document.createElement("a"));
                a.href = "login";
                a.append("Authorize");
            } else {
                errordiv.append(
                    `Error (code "${data.error.code}"):`,
                    document.createElement("br"),
                    data.error.info,
                    document.createElement("br"),
                    "Please raise an issue on the GitHub Issue tracker if the error seems internal to the Tool.",
                );
            }
        } else if (data.upload && data.upload.warnings) {
            // WM warning case - copied from PHP, not tested in practice
            const warningdiv = document.createElement('div');
            warningdiv.className = 'warning';
            uploadbutton.parentElement.appendChild(warningdiv);

            for (let w in data.upload.warnings) {
                if (w === "badfilename") {
                    warningdiv.append(
                        "The filename is not valid for Wikimedia Commons. Please choose a different one.",
                    );
                    force_removebutton = true;

                    // include other warnings from response.php
                } else if (w.startsWith("exists")) {
                    let a = document.createElement("a");
                    a.href = "https://commons.wikimedia.org/wiki/File:" + fname.replace(" ", "_");
                    a.setAttribute("target", "_blank");
                    a.append(fname);

                    if (w === "exists-normalized") {
                        warningdiv.append(
                            "Warning: a file with a similar name already exists on Commons.",
                            document.createElement("br"),
                        );
                    } else {
                        warningdiv.append(
                            "Warning: the file ",
                            a,
                            " already exists on Commons.",
                            document.createElement("br"),
                        );
                    }
                    if (fname.replace(" ", "_") === "My_Parliament.svg") {
                        warningdiv.append("This is a testing file, which you can try to overwrite ");
                    } else {
                        warningdiv.append("If you have confirmed that you want to overwrite that file, you can try to overwrite it ");
                    }
                    warningdiv.append(
                        "by clicking on the Upload button again.",
                        document.createElement("br"),
                        "Commons usually does not allow to do that, depending on your user rights. In any case, if you abuse this feature, you will be blocked."
                    );
                    retry_ignore = true;
                } else if (w === "duplicate") {
                    warningdiv.append(
                        "Warning: the file you are trying to upload is a duplicate of an existing file on Commons.",
                        document.createElement("br"),
                        "If you are sure that you want to upload it anyway, you can click the Upload button again.",
                    );
                    retry_ignore = true;
                } else {
                    // unrecognized warning
                    warningdiv.append(
                        `Warning: ${w}: ${data.upload.warnings[w]}`,
                    );
                    force_removebutton = true;
                }
            }
        } else {
            // other error case
            const div = document.createElement('div');
            div.className = 'error';
            div.append(
                "Unrecognized API response from server:",
                document.createElement("br"),
                JSON.stringify(data),
            );

            uploadbutton.parentElement.appendChild(div);
            force_removebutton = true;
        }

        if (retry_ignore && !force_removebutton) {
            uploadbutton.disabled = false;
            const onClick = uploadbutton.getAttribute("onClick");
            uploadbutton.setAttribute("onClick", onClick.replace("ignore=false", "ignore=true"));
        } else {
            uploadbutton.remove();
        }
    }).fail(function (xhr, textStatus, errorThrown) {
        // Error, including those thrown by the server
        const errordiv = document.createElement('div');
        errordiv.className = 'error';
        uploadbutton.parentElement.appendChild(errordiv);
        errordiv.innerHTML = xhr.responseText || ("Error: " + textStatus + ", " + errorThrown);
        uploadbutton.remove();
    });
}
