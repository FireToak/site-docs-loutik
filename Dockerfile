FROM nginx:alpine
LABEL maintainer="Louis MEDO"

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY public/ /usr/share/nginx/html/

EXPOSE 80