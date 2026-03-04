varying vec3 vPosition;

uniform float uTextureScale;

void main() {
    vPosition = position.xyz / uTextureScale;
}
