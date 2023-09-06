export default function drag(dragElement: HTMLElement | null) {
  if (!dragElement) return;

  dragElement.style.left = "50px";
  dragElement.style.top = "50px";

  var dragStartX = 0,
    dragStartY = 0;
  var containerWidth = window.innerWidth;
  var containerHeight = window.innerHeight;
  var elementWidth = dragElement.offsetWidth;
  var elementHeight = dragElement.offsetHeight;

  dragElement.addEventListener("mousedown", function (e) {
    dragStartX = e.clientX - dragElement.offsetLeft;
    dragStartY = e.clientY - dragElement.offsetTop;
    document.addEventListener("mousemove", dragElementListener);
  });

  document.addEventListener("mouseup", function (e) {
    document.removeEventListener("mousemove", dragElementListener);
  });

  function dragElementListener(e: MouseEvent) {
    var posX = e.clientX - dragStartX;
    var posY = e.clientY - dragStartY;

    if (posX < 20) {
      posX = 20;
    } else if (posX > containerWidth - elementWidth - 20) {
      posX = containerWidth - elementWidth - 20;
    }

    if (posY < 0) {
      posY = 0;
    } else if (posY > containerHeight - elementHeight - 20) {
      posY = containerHeight - elementHeight - 20;
    }

    if (!dragElement) return;

    dragElement.style.left = posX + "px";
    dragElement.style.top = posY + "px";
  }
}
