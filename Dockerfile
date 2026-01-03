FROM nginx:alpine
LABEL maintainer="Louis MEDO"

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY /build/ /usr/share/nginx/html/

EXPOSE 80