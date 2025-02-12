FROM alpine:3.2

RUN apk --update add alpine-sdk xz poppler-dev pango-dev m4 libtool perl autoconf automake coreutils python-dev zlib-dev freetype-dev glib-dev cmake && \
    cd / && \
    git clone https://github.com/BWITS/fontforge.git && \
    cd fontforge && \
    ./bootstrap --force && \
    ./configure --without-iconv && \
    make && \
    make install && \
    cd / && \
    git clone git://github.com/coolwanglu/pdf2htmlEX.git && \
    cd pdf2htmlEX && \
    export PKG_CONFIG_PATH=$PKG_CONFIG_PATH:/usr/local/lib/pkgconfig && \
    cmake . && make && sudo make install && \
    apk del alpine-sdk xz poppler-dev pango-dev m4 libtool perl autoconf automake coreutils python-dev zlib-dev freetype-dev glib-dev cmake && \
    apk add libpng python freetype glib libintl libxml2 libltdl cairo poppler pango && \
    rm -rf /var/lib/apt/lists/* && \
    rm /var/cache/apk/* && \
    rm -rf /fontforge /libspiro /libuninameslist /pdf2htmlEX

RUN ln -s usr/local/bin/pdf2htmlEX
RUN mkdir /pdf && chmod 0775 /pdf
VOLUME /pdf
WORKDIR /pdf